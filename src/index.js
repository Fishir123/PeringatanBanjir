require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const sensorRoutes = require('./routes/sensor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FloodGuard API berjalan',
    version: '1.0.0',
    endpoints: {
      'POST /api/sensor': 'Kirim data sensor dari ESP32',
      'GET /api/sensor': 'Ambil semua data sensor',
      'GET /api/sensor/latest/:device_id': 'Data terbaru per device',
      'GET /api/sensor/:device_id/history': 'Riwayat data per device',
    },
  });
});

// Routes
app.use('/api/sensor', sensorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`[App] FloodGuard API berjalan di http://localhost:${PORT}`);
  });
}

start();
