const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_floodguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi saat startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] Koneksi database berhasil');
    conn.release();
  } catch (err) {
    console.error('[DB] Gagal koneksi database:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
