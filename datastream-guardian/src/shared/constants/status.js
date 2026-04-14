export const statusLabels = {
  safe: 'Aman',
  alert: 'Siaga',
  warning: 'Waspada',
  danger: 'Bahaya',
};

export const statusOrder = ['safe', 'alert', 'warning', 'danger'];

export function mapBackendWaterStatus(waterStatus) {
  switch (waterStatus) {
    case 'safe':
      return 'safe';
    case 'warning':
      return 'alert';
    case 'danger':
      return 'warning';
    case 'critical':
      return 'danger';
    default:
      return 'safe';
  }
}

export function deriveUiStatusByWaterLevel(level) {
  const waterLevel = Number(level);

  if (Number.isNaN(waterLevel)) {
    return 'safe';
  }

  if (waterLevel < 50) {
    return 'safe';
  }

  if (waterLevel < 100) {
    return 'alert';
  }

  if (waterLevel < 150) {
    return 'warning';
  }

  return 'danger';
}
