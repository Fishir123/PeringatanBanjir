const express = require('express');
const router = express.Router();

const {
  getIntegrationConfig,
  saveIntegrationConfig,
  fetchWeatherData,
  fetchTideData,
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
      weatherLocationLat: req.body.weatherLocationLat,
      weatherLocationLon: req.body.weatherLocationLon,
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
    const result = await fetchWeatherData(config);

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

router.post('/tide/fetch', async (req, res) => {
  try {
    const config = await getIntegrationConfig();
    const result = await fetchTideData(config);

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

router.post('/fetch-all', async (req, res) => {
  try {
    const config = await getIntegrationConfig();

    const [weather, tide] = await Promise.allSettled([
      fetchWeatherData(config),
      fetchTideData(config),
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
