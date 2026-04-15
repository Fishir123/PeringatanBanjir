require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var usersRouter = require('./routes/users');
var sensorRouter = require('./routes/sensor');

// MQTT Subscriber for ESP32 sensor data
var mqttSubscriber = require('./mqtt/subscriber');

var app = express();
var frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(frontendDistPath));

app.use('/users', usersRouter);
app.use('/api/sensor-data', sensorRouter);

app.get('*', function(req, res, next) {
  if (req.path.startsWith('/api/') || req.path.startsWith('/users')) {
    return next();
  }

  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start MQTT subscriber
mqttSubscriber.connect();

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
