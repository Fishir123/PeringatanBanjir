const express = require('express');
const router = express.Router();
const db = require('../config/db');

const {
  getIntegrationConfig,
  saveIntegrationConfig,
  fetchWeatherDataWithCooldown,
  fetchTideDataWithCooldown,
  toPublicConfig,
} = require('../services/externalDataService');

router.get('/config', async (req, res) => {
  try {
    const config = await getIntegrationConfig();

    res.json({
      message: 'Konfigurasi integrasi berhasil diambil',
      data: toPublicConfig(config),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil konfigurasi integrasi',
      error: error.message,
    });
  }
});

router.put('/config', async (req, res) => {
  try {
    const nextConfig = {
      weatherApiBaseUrl: req.body.weatherApiBaseUrl,
      weatherApiKey: req.body.weatherApiKey,
      weatherBmkgAdm4: req.body.weatherBmkgAdm4,
      tideApiBaseUrl: req.body.tideApiBaseUrl,
      tideApiKey: req.body.tideApiKey,
      tideStationCode: req.body.tideStationCode,
    };

    const savedConfig = await saveIntegrationConfig(nextConfig);

    res.json({
      message: 'Konfigurasi integrasi berhasil disimpan',
      data: toPublicConfig(savedConfig),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menyimpan konfigurasi integrasi',
      error: error.message,
    });
  }
});

router.post('/weather/fetch', async (req, res) => {
  try {
    const config = await getIntegrationConfig();
    const force = String(req.query.force || '').toLowerCase() === 'true';
    const result = await fetchWeatherDataWithCooldown(config, { force });

    res.json({
      message: 'Data cuaca berhasil diambil',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data cuaca',
      error: error.message,
    });
  }
});

router.get('/weather/latest', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, rainfall_mm, humidity, temperature, wind_speed, wind_direction,
              weather_code, weather_desc, weather_desc_en, cloud_cover_percent, wind_direction_to,
              visibility_km, bmkg_local_datetime, bmkg_utc_datetime, bmkg_raw,
              forecast_date, forecast_hour, rain_duration_hours, rain_intensity,
              source, location_code, recorded_at
       FROM weather_data
       ORDER BY recorded_at DESC
       LIMIT 1`
    );

    res.json({
      message: 'Data cuaca terbaru berhasil diambil',
      data: rows[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data cuaca terbaru',
      error: error.message,
    });
  }
});

router.get('/weather/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 24, 100);

    const [rows] = await db.query(
      `SELECT id, rainfall_mm, humidity, temperature, wind_speed, wind_direction,
              weather_code, weather_desc, weather_desc_en, cloud_cover_percent, wind_direction_to,
              visibility_km, bmkg_local_datetime, bmkg_utc_datetime, bmkg_raw,
              forecast_date, forecast_hour, rain_duration_hours, rain_intensity,
              source, location_code, recorded_at
       FROM weather_data
       ORDER BY recorded_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      message: 'Riwayat data cuaca berhasil diambil',
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil riwayat data cuaca',
      error: error.message,
    });
  }
});

router.post('/tide/fetch', async (req, res) => {
  try {
    const config = await getIntegrationConfig();
    const force = String(req.query.force || '').toLowerCase() === 'true';
    const result = await fetchTideDataWithCooldown(config, { force });

    res.json({
      message: 'Data pasang surut berhasil diambil',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data pasang surut',
      error: error.message,
    });
  }
});

router.get('/tide/latest', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, tide_level_cm, tide_status,
              high_tide_time, high_tide_level_cm,
              low_tide_time, low_tide_level_cm,
              prediction_date, source, station_code, recorded_at
       FROM tidal_data
       ORDER BY recorded_at DESC
       LIMIT 1`
    );

    res.json({
      message: 'Data pasang surut terbaru berhasil diambil',
      data: rows[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data pasang surut terbaru',
      error: error.message,
    });
  }
});

router.get('/tide/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 24, 200);

    const [rows] = await db.query(
      `SELECT id, tide_level_cm, tide_status, recorded_at
       FROM tidal_data
       ORDER BY recorded_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      message: 'Riwayat pasang surut berhasil diambil',
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil riwayat pasang surut',
      error: error.message,
    });
  }
});

router.post('/fetch-all', async (req, res) => {
  try {
    const config = await getIntegrationConfig();
    const force = String(req.query.force || '').toLowerCase() === 'true';

    const [weather, tide] = await Promise.allSettled([
      fetchWeatherDataWithCooldown(config, { force }),
      fetchTideDataWithCooldown(config, { force }),
    ]);

    res.json({
      message: 'Eksekusi fetch cuaca + pasang surut selesai',
      data: {
        weather: weather.status === 'fulfilled' ? weather.value : { error: weather.reason.message },
        tide: tide.status === 'fulfilled' ? tide.value : { error: tide.reason.message },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menjalankan fetch gabungan',
      error: error.message,
    });
  }
});

module.exports = router;
