const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Semua route butuh autentikasi
router.use(authMiddleware);

// ── GET /users ─────────────────────────────────────────────────────────────
// Ambil semua user dari tabel admins
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, username, email, full_name, phone, role, is_active, last_login, created_at
       FROM admins
       ORDER BY created_at DESC`
    );
    return res.json({ data: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
});

// ── GET /users/:id ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, username, email, full_name, phone, role, is_active, last_login, created_at
       FROM admins WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });
    return res.json({ data: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil user', error: error.message });
  }
});

// ── POST /users ─────────────────────────────────────────────────────────────
// Tambah user baru
router.post('/', async (req, res) => {
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

    const [result] = await db.execute(
      `INSERT INTO admins (username, password_hash, email, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [username, hash, email || null, fullName || null, phone || null, role || 'admin']
    );

    const [newUser] = await db.execute(
      `SELECT id, username, email, full_name, phone, role, is_active, last_login, created_at
       FROM admins WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'User berhasil dibuat', data: newUser[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal membuat user', error: error.message });
  }
});

// ── PUT /users/:id ──────────────────────────────────────────────────────────
// Update user
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, phone, role, is_active, password } = req.body || {};

    const [rows] = await db.execute('SELECT id FROM admins WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Build dynamic update
    const fields = [];
    const values = [];

    if (fullName !== undefined) { fields.push('full_name = ?'); values.push(fullName); }
    if (email !== undefined)    { fields.push('email = ?');     values.push(email);    }
    if (phone !== undefined)    { fields.push('phone = ?');     values.push(phone);    }
    if (role !== undefined)     { fields.push('role = ?');      values.push(role);     }
    if (is_active !== undefined){ fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      values.push(hash);
    }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada field yang diupdate' });

    values.push(req.params.id);
    await db.execute(`UPDATE admins SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await db.execute(
      `SELECT id, username, email, full_name, phone, role, is_active, last_login, created_at
       FROM admins WHERE id = ? LIMIT 1`,
      [req.params.id]
    );

    return res.json({ message: 'User berhasil diupdate', data: updated[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal update user', error: error.message });
  }
});

// ── DELETE /users/:id ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // Cegah hapus diri sendiri
    if (String(req.user?.id) === String(req.params.id)) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    const [rows] = await db.execute('SELECT id FROM admins WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });

    await db.execute('DELETE FROM admins WHERE id = ?', [req.params.id]);
    return res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal menghapus user', error: error.message });
  }
});

module.exports = router;
