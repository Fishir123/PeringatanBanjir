export const statusLabels = {
  safe: 'Aman',
  alert: 'Siaga',
  danger: 'Bahaya',
};

export const statusOrder = ['safe', 'alert', 'danger'];

export function mapBackendWaterStatus(waterStatus) {
  switch (waterStatus) {
    case 'safe':
      return 'safe';
    case 'alert':
      return 'alert';
    case 'warning':
      return 'alert';
    case 'danger':
      return 'danger';
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

  if (waterLevel <= 3) {
    return 'danger';
  }

  if (waterLevel <= 10) {
    return 'alert';
  }

  return 'safe';
}
