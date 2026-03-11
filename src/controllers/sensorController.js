const { pool } = require('../config/db');

/**
 * POST /api/sensor
 * Menerima data dari ESP32 dan simpan ke database
 */
async function storeSensorData(req, res) {
  try {
    const { device_id, water_level, rainfall, battery } = req.body;

    // Validasi field wajib
    if (device_id === undefined || water_level === undefined || rainfall === undefined || battery === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: device_id, water_level, rainfall, battery',
      });
    }

    // Validasi tipe data numerik
    if (
      isNaN(Number(device_id)) ||
      isNaN(Number(water_level)) ||
      isNaN(Number(rainfall)) ||
      isNaN(Number(battery))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus berupa angka',
      });
    }

    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp

    const [result] = await pool.execute(
      'INSERT INTO sensor_data (device_id, water_level, rainfall, battery, timestamp) VALUES (?, ?, ?, ?, ?)',
      [Number(device_id), Number(water_level), Number(rainfall), Number(battery), timestamp]
    );

    return res.status(201).json({
      success: true,
      message: 'Data sensor berhasil disimpan',
      data: {
        id: result.insertId,
        device_id: Number(device_id),
        water_level: Number(water_level),
        rainfall: Number(rainfall),
        battery: Number(battery),
        timestamp,
      },
    });
  } catch (err) {
    console.error('[Controller] storeSensorData error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * GET /api/sensor
 * Ambil semua data sensor (dengan pagination opsional)
 */
async function getAllSensorData(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const device_id = req.query.device_id;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM sensor_data';
    const params = [];

    if (device_id) {
      query += ' WHERE device_id = ?';
      params.push(Number(device_id));
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Hitung total data
    let countQuery = 'SELECT COUNT(*) as total FROM sensor_data';
    const countParams = [];
    if (device_id) {
      countQuery += ' WHERE device_id = ?';
      countParams.push(Number(device_id));
    }
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Controller] getAllSensorData error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * GET /api/sensor/latest/:device_id
 * Ambil data terbaru dari device tertentu
 */
async function getLatestByDevice(req, res) {
  try {
    const { device_id } = req.params;

    if (isNaN(Number(device_id))) {
      return res.status(400).json({ success: false, message: 'device_id harus berupa angka' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM sensor_data WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1',
      [Number(device_id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data untuk device_id ${device_id} tidak ditemukan`,
      });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Controller] getLatestByDevice error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * GET /api/sensor/:device_id/history
 * Ambil riwayat data dari device tertentu
 */
async function getHistoryByDevice(req, res) {
  try {
    const { device_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    if (isNaN(Number(device_id))) {
      return res.status(400).json({ success: false, message: 'device_id harus berupa angka' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM sensor_data WHERE device_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [Number(device_id), limit, offset]
    );

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM sensor_data WHERE device_id = ?',
      [Number(device_id)]
    );

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Controller] getHistoryByDevice error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { storeSensorData, getAllSensorData, getLatestByDevice, getHistoryByDevice };
