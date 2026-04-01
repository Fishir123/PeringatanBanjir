import React, { useState, useEffect } from 'react';
import WaterLevelCard from './WaterLevelCard';
import { getLatestSensorData } from '../services/api';

function Dashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getLatestSensorData();
      setSensorData(response.data || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data sensor. Pastikan backend berjalan.');
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh setiap 5 detik
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = () => {
    if (!lastUpdate) return '-';
    return lastUpdate.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Memuat data sensor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-info">
        <p>Auto-refresh: Setiap 5 detik</p>
        <p>Update terakhir: {formatLastUpdate()}</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Coba Lagi</button>
        </div>
      )}

      {!error && sensorData.length === 0 && (
        <div className="no-data">
          <h3>Belum Ada Data Sensor</h3>
          <p>Kirim data sensor menggunakan POST request ke:</p>
          <code>POST http://localhost:3000/api/sensor-data</code>
          <pre>{`{
  "device_id": "sensor1",
  "water_level": 75
}`}</pre>
        </div>
      )}

      <div className="sensor-grid">
        {sensorData.map((data, index) => (
          <WaterLevelCard key={data.device_id || index} data={data} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
