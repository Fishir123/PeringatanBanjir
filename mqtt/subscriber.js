/**
 * MQTT Subscriber for FloodGuard Sensor Data
 * 
 * Listens to MQTT topics from ESP32 sensors and stores data in MySQL database.
 * 
 * Topic format: {prefix}/sensor/{device_id}/data
 * Example: floodguard/sensor/SENSOR-001/data
 * 
 * Expected payload (JSON):
 * {
 *   "water_level": 45.2,        // Required: water level in cm
 *   "distance_cm": 150.5,       // Optional: raw ultrasonic distance
 *   "battery_level": 85,        // Optional: battery percentage (0-100)
 *   "signal_strength": -67      // Optional: WiFi signal in dBm
 * }
 */

const mqtt = require('mqtt');
const pool = require('../config/db');

// Configuration from environment variables
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'floodguard';

// Topic pattern: floodguard/sensor/+/data (+ is wildcard for device_id)
const SENSOR_DATA_TOPIC = `${MQTT_TOPIC_PREFIX}/sensor/+/data`;

let client = null;

/**
 * Determine water status based on water level
 * Uses default thresholds - can be customized per device in the future
 */
function getWaterStatus(waterLevel) {
  if (waterLevel < 100) return 'safe';
  if (waterLevel < 150) return 'warning';
  if (waterLevel < 200) return 'danger';
  return 'critical';
}

/**
 * Extract device_id from topic
 * Topic format: floodguard/sensor/{device_id}/data
 */
function extractDeviceId(topic) {
  const parts = topic.split('/');
  // parts[0] = floodguard, parts[1] = sensor, parts[2] = device_id, parts[3] = data
  if (parts.length >= 4 && parts[1] === 'sensor' && parts[3] === 'data') {
    return parts[2];
  }
  return null;
}

/**
 * Save sensor data to database
 */
async function saveSensorData(deviceId, data) {
  try {
    const waterLevel = parseFloat(data.water_level);
    
    if (isNaN(waterLevel)) {
      console.error(`[MQTT] Invalid water_level from ${deviceId}:`, data.water_level);
      return false;
    }

    const waterStatus = getWaterStatus(waterLevel);
    
    const query = `
      INSERT INTO sensor_data (device_id, water_level, distance_cm, battery_level, signal_strength, water_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      deviceId,
      waterLevel,
      data.distance_cm || null,
      data.battery_level || null,
      data.signal_strength || null,
      waterStatus
    ];

    await pool.execute(query, values);
    
    console.log(`[MQTT] Data saved: ${deviceId} - water_level: ${waterLevel}cm (${waterStatus})`);
    return true;
  } catch (error) {
    console.error(`[MQTT] Error saving data for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Handle incoming MQTT messages
 */
function handleMessage(topic, message) {
  try {
    const deviceId = extractDeviceId(topic);
    
    if (!deviceId) {
      console.warn(`[MQTT] Could not extract device_id from topic: ${topic}`);
      return;
    }

    const payload = JSON.parse(message.toString());
    
    console.log(`[MQTT] Received from ${deviceId}:`, payload);

    // Validate required fields
    if (payload.water_level === undefined) {
      console.error(`[MQTT] Missing water_level in payload from ${deviceId}`);
      return;
    }

    // Save to database
    saveSensorData(deviceId, payload);
    
  } catch (error) {
    console.error('[MQTT] Error processing message:', error.message);
  }
}

/**
 * Connect to MQTT broker and start listening
 */
function connect() {
  console.log(`[MQTT] Connecting to broker: ${MQTT_BROKER_URL}`);
  
  client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `floodguard-server-${Date.now()}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 5000, // Auto-reconnect every 5 seconds
  });

  client.on('connect', () => {
    console.log('[MQTT] Connected to broker');
    
    // Subscribe to sensor data topic
    client.subscribe(SENSOR_DATA_TOPIC, { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Subscribe error:', err);
      } else {
        console.log(`[MQTT] Subscribed to: ${SENSOR_DATA_TOPIC}`);
      }
    });
  });

  client.on('message', handleMessage);

  client.on('error', (error) => {
    console.error('[MQTT] Connection error:', error.message);
  });

  client.on('close', () => {
    console.log('[MQTT] Connection closed');
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Attempting to reconnect...');
  });

  client.on('offline', () => {
    console.log('[MQTT] Client is offline');
  });

  return client;
}

/**
 * Disconnect from MQTT broker
 */
function disconnect() {
  if (client) {
    client.end(true);
    console.log('[MQTT] Disconnected from broker');
  }
}

/**
 * Get connection status
 */
function isConnected() {
  return client && client.connected;
}

module.exports = {
  connect,
  disconnect,
  isConnected
};
