import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch data dari Express API
  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-data');
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }
      const data = await response.json();
      setSensorData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    
    // Refresh data setiap 5 detik
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistem Peringatan Banjir</h1>
      </header>
      
      <main className="App-main">
        <div className="card">
          <h2>Data Sensor</h2>
          
          {loading && <p className="loading">Memuat data...</p>}
          
          {error && (
            <div className="error">
              <p>Error: {error}</p>
              <p className="hint">Pastikan Express server berjalan di port 3000</p>
            </div>
          )}
          
          {sensorData && (
            <div className="sensor-info">
              <p><strong>Device ID:</strong> {sensorData.device_id || '-'}</p>
              <p><strong>Water Level:</strong> {sensorData.water_level || '-'}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Status Koneksi</h2>
          <p className={error ? 'status-offline' : 'status-online'}>
            {error ? 'Offline' : 'Online'}
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
