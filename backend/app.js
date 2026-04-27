require('dotenv').config();
const dns = require('dns');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Keep default DNS order if current Node version does not support this API.
}

var usersRouter = require('./routes/users');
var sensorRouter = require('./routes/sensor');
var externalRouter = require('./routes/external');
var externalService = require('./services/externalDataService');

// MQTT Subscriber for ESP32 sensor data
var mqttSubscriber = require('./mqtt/subscriber');

var app = express();
var frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

app.set('etag', false);

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static(frontendDistPath));

app.use('/users', usersRouter);
app.use('/api/sensor-data', sensorRouter);
app.use('/api/external', externalRouter);

app.get('*', function(req, res, next) {
  if (req.path.startsWith('/api/') || req.path.startsWith('/users')) {
    return next();
  }

  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start MQTT subscriber
mqttSubscriber.connect();

function getIntervalMs(envKey, fallbackMs) {
  var rawValue = Number(process.env[envKey]);
  if (!Number.isFinite(rawValue) || rawValue <= 0) return fallbackMs;
  return rawValue;
}

function shouldEnableScheduler() {
  var value = String(process.env.ENABLE_EXTERNAL_SCHEDULER || '').toLowerCase();
  if (!value) return true;
  return value !== 'false' && value !== '0' && value !== 'off';
}

function startExternalScheduler() {
  if (!shouldEnableScheduler()) {
    return;
  }

  var weatherIntervalMs = getIntervalMs('WEATHER_FETCH_INTERVAL_MS', 15 * 60 * 1000);
  var tideIntervalMs = getIntervalMs('TIDE_FETCH_INTERVAL_MS', 60 * 60 * 1000);

  var runWeatherFetch = async () => {
    try {
      var config = await externalService.getIntegrationConfig();
      await externalService.fetchWeatherDataWithCooldown(config);
    } catch (error) {
      console.error('Scheduler weather fetch failed:', error.message);
    }
  };

  var runTideFetch = async () => {
    try {
      var config = await externalService.getIntegrationConfig();
      await externalService.fetchTideDataWithCooldown(config);
    } catch (error) {
      console.error('Scheduler tide fetch failed:', error.message);
    }
  };

  setTimeout(runWeatherFetch, 5000);
  setTimeout(runTideFetch, 7000);
  setInterval(runWeatherFetch, weatherIntervalMs);
  setInterval(runTideFetch, tideIntervalMs);
}

startExternalScheduler();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  mqttSubscriber.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  mqttSubscriber.disconnect();
  process.exit(0);
});

module.exports = app;
