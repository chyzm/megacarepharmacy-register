import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const data = await kv.get(`registration:${id}`);
    
    if (!data) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
}