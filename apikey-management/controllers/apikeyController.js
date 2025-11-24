const crypto = require('crypto');
const { pool } = require('../database/db');
const { API_KEY_PREFIX } = require('../config');

function generateApiKey() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${API_KEY_PREFIX}${randomBytes}`;
}

async function createApiKey(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const { name, expiresInDays } = req.body;

    // Check if user exists
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const apiKey = generateApiKey();

    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const [result] = await pool.query(
      `INSERT INTO api_keys (user_id, api_key, name, created_by, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, apiKey, name || 'Default Key', req.admin.id, expiresAt]
    );

    const [newKey] = await pool.query(
      'SELECT * FROM api_keys WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'API Key berhasil dibuat',
      apiKey: {
        ...newKey[0],
        api_key: apiKey // Show full key only once
      },
      warning: '⚠️ Simpan API Key ini dengan aman. Anda tidak akan bisa melihatnya lagi!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function listApiKeys(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    const [users] = await pool.query(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const [apiKeys] = await pool.query(
      `SELECT 
        id, user_id,
        CONCAT(SUBSTRING(api_key, 1, 15), '...') as api_key,
        name, is_active, created_at, last_used, expires_at
      FROM api_keys 
      WHERE user_id = ?`,
      [userId]
    );

    res.json({
      user: users[0],
      total: apiKeys.length,
      apiKeys
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function deactivateApiKey(req, res) {
  try {
    const keyId = parseInt(req.params.keyId);

    const [keys] = await pool.query(
      'SELECT * FROM api_keys WHERE id = ?',
      [keyId]
    );

    if (keys.length === 0) {
      return res.status(404).json({ error: 'API Key tidak ditemukan' });
    }

    await pool.query(
      `UPDATE api_keys 
       SET is_active = FALSE, deactivated_at = NOW(), deactivated_by = ? 
       WHERE id = ?`,
      [req.admin.id, keyId]
    );

    const [updated] = await pool.query(
      `SELECT 
        id, user_id,
        CONCAT(SUBSTRING(api_key, 1, 15), '...') as api_key,
        name, is_active, deactivated_at
      FROM api_keys 
      WHERE id = ?`,
      [keyId]
    );

    res.json({
      message: 'API Key berhasil dinonaktifkan',
      apiKey: updated[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = {
  createApiKey,
  listApiKeys,
  deactivateApiKey
};