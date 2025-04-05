require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 10000;

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';

// Database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

if (isProduction || isRender) {
  poolConfig.ssl = { 
    rejectUnauthorized: false 
  };
}

const pool = new Pool(poolConfig);

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.stack);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving with proper cache headers
app.use(express.static(path.join(__dirname), {
  maxAge: isProduction ? '1y' : '0',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 1. Create new registrant
app.post('/api/registrants', async (req, res) => {
  try {
    const { 
      firstName, lastName, email, mobile, 
      jobTitle, company, city, country 
    } = req.body;

    // Input validation
    if (!firstName || !email || !mobile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
    res.status(500).json({ 
      error: 'Internal server error',
      details: isProduction ? null : error.message
    });
  }
});

// [Keep all your other existing routes unchanged...]

// HTML file serving with proper error handling
const validPages = new Set([
  'index.html',
  'registrant_details.html',
  'print_qr_sticker.html',
  'admin.html',
  'login.html'
]);

app.get('*', (req, res, next) => {
  const requestedPage = req.path.split('/').pop();
  
  if (validPages.has(requestedPage)) {
    res.sendFile(path.join(__dirname, requestedPage), err => {
      if (err) {
        console.error('File serving error:', err);
        next(err);
      }
    });
  } else if (req.path.startsWith('/assets/')) {
    next(); // Let static middleware handle it
  } else {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    details: isProduction ? null : err.message
  });
});

// Server startup
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${poolConfig.connectionString ? 'Configured' : 'Missing'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});