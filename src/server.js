require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,)));

// Routes
app.post('/api/registrants', async (req, res) => {
  try {
    const { 
      firstName, lastName, email, mobile, 
      jobTitle, company, city, country 
    } = req.body;

    const result = await pool.query(
      `INSERT INTO registrants (
        first_name, last_name, email, mobile, 
        job_title, company, city, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id, created_at`,
      [firstName, lastName, email, mobile, jobTitle, company, city, country]
    );

    res.status(201).json({
      id: `reg-${result.rows[0].id}`,
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
    const requestedPage = req.path.split('/').pop();
    const validPages = [
      'index.html',
      'registrant_details.html',
      'print_qr_sticker.html',
      'admin.html',
      'login.html'
    ];
    
    if (validPages.includes(requestedPage)) {
      res.sendFile(path.join(__dirname, requestedPage));
    } else {
      res.status(404).send('Not found');
    }
  });

app.delete('/api/registrants/:id', async (req, res) => {
  try {
    const id = req.params.id.replace('reg-', '');
    await pool.query(
      `DELETE FROM registrants WHERE id = $1`,
      [id]
    );
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});