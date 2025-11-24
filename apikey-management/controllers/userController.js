const { pool } = require('../database/db');

async function createUser(req, res) {
  try {
    const { firstname, lastname, email } = req.body;

    if (!firstname || !lastname || !email) {
      return res.status(400).json({
        error: 'Firstname, lastname, dan email wajib diisi'
      });
    }

    // Check duplicate email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (firstname, lastname, email, created_by) VALUES (?, ?, ?, ?)',
      [firstname, lastname, email, req.admin.id]
    );

    const [newUser] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: newUser[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function listUsers(req, res) {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.*,
        COUNT(ak.id) as apiKeysCount
      FROM users u
      LEFT JOIN api_keys ak ON u.id = ak.user_id
      GROUP BY u.id
    `);

    res.json({
      total: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getUserDetail(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
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
      [req.params.id]
    );

    res.json({
      user: users[0],
      apiKeys
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { createUser, listUsers, getUserDetail };