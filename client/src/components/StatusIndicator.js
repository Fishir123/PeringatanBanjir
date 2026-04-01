import React from 'react';

function StatusIndicator({ waterLevel }) {
  const getStatus = (level) => {
    if (level < 50) {
      return { status: 'AMAN', className: 'status-safe', description: 'Level air normal' };
    } else if (level < 100) {
      return { status: 'WASPADA', className: 'status-warning', description: 'Perlu perhatian' };
    } else {
      return { status: 'BAHAYA', className: 'status-danger', description: 'Potensi banjir!' };
    }
  };

  const { status, className, description } = getStatus(waterLevel);

  return (
    <div className={`status-indicator ${className}`}>
      <span className="status-badge">{status}</span>
      <span className="status-description">{description}</span>
    </div>
  );
}

export default StatusIndicator;
