import { deriveUiStatusByWaterLevel, mapBackendWaterStatus, statusLabels } from '@/shared/constants/status';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function mapSensorRowToUi(row) {
  const waterLevel = toNumber(row?.water_level);
  const uiStatus = row?.water_status
    ? mapBackendWaterStatus(row.water_status)
    : deriveUiStatusByWaterLevel(waterLevel);

  return {
    id: row?.id,
    deviceId: row?.device_id ?? '-',
    timestamp: row?.created_at,
    waterLevel,
    status: uiStatus,
    statusLabel: statusLabels[uiStatus],
  };
}

export function buildWaterLevelChartData(historyRows, limit = 24) {
  const normalized = (historyRows ?? []).map(mapSensorRowToUi);
  const chronological = normalized.slice().reverse().slice(-limit);

  return chronological.map((row) => ({
    time: new Date(row.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    level: row.waterLevel,
  }));
}

export function buildRainfallChartData(historyRows, limit = 24) {
  const normalized = (historyRows ?? []).map(mapSensorRowToUi);
  const chronological = normalized.slice().reverse().slice(-limit);

  return chronological.map((row) => ({
    time: new Date(row.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    rainfall: 0,
  }));
}

export function buildDashboardStatus(latestRows, historyRows) {
  const latestNormalized = (latestRows ?? []).map(mapSensorRowToUi);
  const historyNormalized = (historyRows ?? []).map(mapSensorRowToUi);

  const latestWaterLevel = latestNormalized[0]?.waterLevel ?? 0;
  const latestStatus = latestNormalized[0]?.status ?? 'safe';
  const avgWaterLevel = historyNormalized.length
    ? historyNormalized.reduce((total, item) => total + item.waterLevel, 0) / historyNormalized.length
    : 0;

  const totalDevices = latestNormalized.length;
  const devicesOnline = latestNormalized.length;
  const todayNotifications = historyNormalized.filter((item) => {
    const createdAt = new Date(item.timestamp);
    const now = new Date();
    return createdAt.toDateString() === now.toDateString() && item.status !== 'safe';
  }).length;

  return {
    status: latestStatus,
    waterLevel: latestWaterLevel,
    rainfall: 0,
    devicesOnline,
    devicesTotal: totalDevices,
    todayNotifications,
    avgWaterLevel: Number(avgWaterLevel.toFixed(1)),
  };
}

export function buildDeviceRows(latestRows) {
  return (latestRows ?? []).map((row) => {
    const normalized = mapSensorRowToUi(row);

    return {
      id: normalized.deviceId,
      name: normalized.deviceId,
      location: 'Lokasi belum diatur',
      status: 'online',
      battery: '-',
      lastSeen: normalized.timestamp,
      lat: -6.86,
      lng: 107.63,
    };
  });
}

export function buildNotificationRows(historyRows, limit = 4) {
  const normalized = (historyRows ?? []).map(mapSensorRowToUi);
  const active = normalized
    .filter((row) => row.status !== 'safe')
    .slice(0, limit)
    .map((row, index) => ({
      id: `${row.id}-${index}`,
      type: row.status,
      title: `Status ${row.statusLabel}`,
      message: `Perangkat ${row.deviceId} membaca tinggi air ${row.waterLevel.toFixed(1)} cm`,
      timestamp: row.timestamp,
      read: index > 1,
    }));

  if (active.length > 0) {
    return active;
  }

  return [
    {
      id: 'no-alert',
      type: 'safe',
      title: 'Status Normal',
      message: 'Belum ada notifikasi peringatan dari data sensor terbaru.',
      timestamp: new Date().toISOString(),
      read: true,
    },
  ];
}
