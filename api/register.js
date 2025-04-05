// Silence deprecation warnings
process.removeAllListeners('warning');

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error('Empty registration data');
    }

    // Generate unique ID
    const id = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Store in Vercel KV
    await kv.set(`registration:${id}`, JSON.stringify(req.body));
    
    // Prepare response
    const registrationUrl = `${req.headers.origin}/registrant_details.html?id=${id}`;
    res.status(200).json({ 
      success: true,
      id,
      qrData: registrationUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
}