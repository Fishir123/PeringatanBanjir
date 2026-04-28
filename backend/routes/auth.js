const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const [rows] = await db.execute(
      'SELECT id, username, password_hash, role, is_active FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Akun tidak ditemukan atau tidak aktif' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    await db.execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = signToken(user);
    return res.json({
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal login', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const [existing] = await db.execute('SELECT id FROM admins WHERE username = ? LIMIT 1', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO admins (username, password_hash, email, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [username, hash, email || null, fullName || null, phone || null, role || 'admin']
    );

    return res.status(201).json({ message: 'Admin berhasil dibuat' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal register', error: error.message });
  }
});

module.exports = router;
