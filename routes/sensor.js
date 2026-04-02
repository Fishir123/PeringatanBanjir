const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET semua data sensor
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, device_id, water_level, created_at FROM sensor_data ORDER BY created_at DESC LIMIT 500'
    );

    res.json({
      message: 'Data sensor berhasil diambil',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data sensor',
      error: error.message
    });
  }
});

// GET data sensor terbaru per device
router.get('/latest', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s1.id, s1.device_id, s1.water_level, s1.created_at
       FROM sensor_data s1
       INNER JOIN (
         SELECT device_id, MAX(created_at) AS max_created_at
         FROM sensor_data
         GROUP BY device_id
       ) s2 ON s1.device_id = s2.device_id AND s1.created_at = s2.max_created_at
       ORDER BY s1.created_at DESC`
    );

    res.json({
      message: 'Data sensor terbaru berhasil diambil',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data sensor terbaru',
      error: error.message
    });
  }
});

// GET data sensor berdasarkan device_id
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const [rows] = await db.query(
      'SELECT id, device_id, water_level, created_at FROM sensor_data WHERE device_id = ? ORDER BY created_at DESC LIMIT 500',
      [device_id]
    );

    res.json({
      message: `Data sensor untuk device ${device_id}`,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data sensor per device',
      error: error.message
    });
  }
});

// POST - terima data dari wokwi
router.post('/', async (req, res) => {
  try {
    const { device_id, water_level } = req.body;

    if (!device_id || water_level === undefined) {
      return res.status(400).json({
        message: 'Data tidak lengkap'
      });
    }

    const parsedWaterLevel = Number(water_level);

    if (Number.isNaN(parsedWaterLevel)) {
      return res.status(400).json({
        message: 'water_level harus berupa angka'
      });
    }

    const [result] = await db.query(
      'INSERT INTO sensor_data (device_id, water_level) VALUES (?, ?)',
      [device_id, parsedWaterLevel]
    );

    const [insertedRows] = await db.query(
      'SELECT id, device_id, water_level, created_at FROM sensor_data WHERE id = ?',
      [result.insertId]
    );

    res.json({
      message: 'Data berhasil diterima',
      data: insertedRows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menyimpan data sensor',
      error: error.message
    });
  }
});

module.exports = router;
