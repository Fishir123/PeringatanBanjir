const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/auth');
const {
  storeSensorData,
  getAllSensorData,
  getLatestByDevice,
  getHistoryByDevice,
} = require('../controllers/sensorController');

// POST   /api/sensor              - Kirim data dari ESP32 (perlu API key)
router.post('/', apiKeyAuth, storeSensorData);

// GET    /api/sensor              - Ambil semua data (opsional: ?device_id=&limit=&page=)
router.get('/', getAllSensorData);

// GET    /api/sensor/latest/:device_id - Ambil data terbaru per device
router.get('/latest/:device_id', getLatestByDevice);

// GET    /api/sensor/:device_id/history - Ambil riwayat per device
router.get('/:device_id/history', getHistoryByDevice);

module.exports = router;
