require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sensorRouter = require('./routes/sensor');

// MQTT Subscriber for ESP32 sensor data
var mqttSubscriber = require('./mqtt/subscriber');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/sensor-data', sensorRouter);

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
