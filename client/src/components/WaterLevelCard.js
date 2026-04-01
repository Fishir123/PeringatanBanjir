import React from 'react';
import StatusIndicator from './StatusIndicator';

function WaterLevelCard({ data }) {
  const { device_id, water_level, timestamp } = data;

  // Hitung persentase untuk bar visual (max 150cm)
  const percentage = Math.min((water_level / 150) * 100, 100);

  // Tentukan warna bar berdasarkan level
  const getBarColor = (level) => {
    if (level < 50) return '#4caf50';
    if (level < 100) return '#ff9800';
    return '#f44336';
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="water-level-card">
      <div className="card-header">
        <h3>Device: {device_id}</h3>
      </div>
      
      <div className="card-body">
        <div className="water-level-display">
          <span className="water-level-value">{water_level}</span>
          <span className="water-level-unit">cm</span>
        </div>

        <div className="water-level-bar-container">
          <div 
            className="water-level-bar" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getBarColor(water_level)
            }}
          ></div>
        </div>

        <StatusIndicator waterLevel={water_level} />

        <div className="timestamp">
          <small>Update: {formatTime(timestamp)}</small>
        </div>
      </div>
    </div>
  );
}

export default WaterLevelCard;
