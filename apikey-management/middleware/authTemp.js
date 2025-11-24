const { pool } = require('../database/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API Key tidak ditemukan' });
    }

    const [keys] = await pool.query(
      'SELECT * FROM api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (keys.length === 0) {
      return res.status(401).json({ error: 'API Key tidak valid' });
    }

    const keyRecord = keys[0];

    if (!keyRecord.is_active) {
      return res.status(403).json({ error: 'API Key sudah dinonaktifkan' });
    }

    if (keyRecord.expires_at && new Date() > new Date(keyRecord.expires_at)) {
      return res.status(403).json({ error: 'API Key sudah expired' });
    }

    await pool.query(
      'UPDATE api_keys SET last_used = NOW() WHERE id = ?',
      [keyRecord.id]
    );

    const [updatedKeys] = await pool.query(
      'SELECT * FROM api_keys WHERE id = ?',
      [keyRecord.id]
    );

    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [keyRecord.user_id]
    );

    req.user = users[0];
    req.apiKey = updatedKeys[0];

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { verifyAdminToken, verifyApiKey };