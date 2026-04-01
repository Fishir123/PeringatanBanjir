const API_BASE_URL = 'http://localhost:3000/api';

// GET semua data sensor
export const getAllSensorData = async () => {
  const response = await fetch(`${API_BASE_URL}/sensor-data`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// GET data sensor terbaru per device
export const getLatestSensorData = async () => {
  const response = await fetch(`${API_BASE_URL}/sensor-data/latest`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// GET data sensor berdasarkan device_id
export const getSensorDataByDevice = async (deviceId) => {
  const response = await fetch(`${API_BASE_URL}/sensor-data/${deviceId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// POST data sensor baru (untuk testing)
export const postSensorData = async (deviceId, waterLevel) => {
  const response = await fetch(`${API_BASE_URL}/sensor-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_id: deviceId,
      water_level: waterLevel,
    }),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
