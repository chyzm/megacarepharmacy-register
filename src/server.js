require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 10000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// API Routes

// 1. Create new registrant
app.post('/api/registrants', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, jobTitle, company, city, country } = req.body;

    const result = await pool.query(
      `INSERT INTO registrants (
        first_name, last_name, email, mobile, 
        job_title, company, city, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at`,
      [firstName, lastName, email, mobile, jobTitle, company, city, country]
    );

    const registrant = {
      id: `reg-${result.rows[0].id}`,
      firstName,
      lastName,
      email,
      mobile,
      jobTitle,
      company,
      city,
      country,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json(registrant);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get registrant details
app.get('/api/registrants/:id', async (req, res) => {
  try {
    const id = req.params.id.replace('reg-', '');
    const result = await pool.query(
      `SELECT * FROM registrants WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registrant not found' });
    }

    const registrant = result.rows[0];
    res.json({
      firstName: registrant.first_name,
      lastName: registrant.last_name,
      email: registrant.email,
      mobile: registrant.mobile,
      jobTitle: registrant.job_title,
      company: registrant.company,
      city: registrant.city,
      country: registrant.country,
      submissionTime: registrant.created_at
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get all registrants (for admin)
app.get('/api/registrants', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, first_name, last_name, email, mobile, 
        company, created_at 
       FROM registrants 
       ORDER BY created_at DESC`
    );

    res.json(result.rows.map(row => ({
      id: `reg-${row.id}`,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      mobile: row.mobile,
      company: row.company,
      registrationDate: row.created_at
    })));
  } catch (error) {
    console.error('Fetch all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Delete registrant (admin only)
app.delete('/api/registrants/:id', async (req, res) => {
  try {
    const id = req.params.id.replace('reg-', '');
    await pool.query(
      `DELETE FROM registrants WHERE id = $1`,
      [id]
    );
    res.status(204).end();
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin authentication
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Serve HTML files
const validPages = [
  'index.html',
  'registrant_details.html',
  'print_qr_sticker.html',
  'admin.html',
  'login.html'
];

app.get('*', (req, res) => {
  const requestedPage = req.path.split('/').pop();
  
  if (validPages.includes(requestedPage)) {
    res.sendFile(path.join(__dirname, requestedPage));
  } else if (req.path.startsWith('/assets/')) {
    // Allow asset files to be served
    res.sendFile(path.join(__dirname, req.path));
  } else {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});