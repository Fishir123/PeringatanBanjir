const statusLabels = {
    safe: 'Aman',
    alert: 'Siaga',
    danger: 'Bahaya',
};
export { statusLabels };
function rand(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}
function getStatus(waterLevel) {
    if (waterLevel <= 3)
        return 'danger';
    if (waterLevel <= 10)
        return 'alert';
    return 'safe';
}
function generateTimestamps(count, intervalMinutes = 60) {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(now.getTime() - (count - 1 - i) * intervalMinutes * 60000);
        return d.toISOString();
    });
}
// Sensor data (24 hours)
const timestamps24h = generateTimestamps(24);
export const sensorData = timestamps24h.map((ts, i) => {
    const wl = rand(20, 180);
    return {
        id: `SR-${String(i + 1).padStart(3, '0')}`,
        timestamp: ts,
        waterLevel: wl,
        rainfall: rand(0, 80),
        riseSpeed: rand(0, 5),
        rainDuration: rand(0, 180),
        status: getStatus(wl),
        deviceId: `DEV-${String((i % 5) + 1).padStart(3, '0')}`,
    };
});
// Extended sensor data for table
const timestamps100 = generateTimestamps(100, 15);
export const sensorDataExtended = timestamps100.map((ts, i) => {
    const wl = rand(20, 200);
    return {
        id: `SR-${String(i + 1).padStart(4, '0')}`,
        timestamp: ts,
        waterLevel: wl,
        rainfall: rand(0, 80),
        riseSpeed: rand(0, 5),
        rainDuration: rand(0, 180),
        status: getStatus(wl),
        deviceId: `DEV-${String((i % 5) + 1).padStart(3, '0')}`,
    };
});
export const devices = [
    { id: 'DEV-001', name: 'Sensor Hulu Sungai', location: 'Desa Sukamaju', lat: -6.85, lng: 107.62, status: 'online', lastSeen: new Date().toISOString(), battery: 87 },
    { id: 'DEV-002', name: 'Sensor Jembatan Utama', location: 'Desa Cikaret', lat: -6.86, lng: 107.63, status: 'online', lastSeen: new Date().toISOString(), battery: 65 },
    { id: 'DEV-003', name: 'Sensor Bendungan', location: 'Desa Mekarjaya', lat: -6.84, lng: 107.61, status: 'offline', lastSeen: new Date(Date.now() - 3600000 * 3).toISOString(), battery: 12 },
    { id: 'DEV-004', name: 'Sensor Hilir Sungai', location: 'Desa Cimahi', lat: -6.87, lng: 107.64, status: 'online', lastSeen: new Date().toISOString(), battery: 92 },
    { id: 'DEV-005', name: 'Sensor Muara', location: 'Desa Pantai Indah', lat: -6.88, lng: 107.65, status: 'online', lastSeen: new Date().toISOString(), battery: 45 },
];
export const users = [
    { id: 'USR-001', name: 'Ahmad Fauzi', email: 'ahmad@desa.go.id', role: 'Super Admin', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'USR-002', name: 'Siti Rahayu', email: 'siti@desa.go.id', role: 'Operator', status: 'active', lastLogin: new Date(Date.now() - 3600000).toISOString() },
    { id: 'USR-003', name: 'Budi Santoso', email: 'budi@desa.go.id', role: 'Operator', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString() },
    { id: 'USR-004', name: 'Dewi Anggraini', email: 'dewi@desa.go.id', role: 'Operator', status: 'inactive', lastLogin: new Date(Date.now() - 86400000 * 5).toISOString() },
];
export const notifications = [
    { id: 'NOT-001', title: 'Peringatan Banjir!', message: 'Tinggi muka air di Sensor Hulu telah melampaui batas bahaya (180cm).', type: 'danger', timestamp: new Date().toISOString(), read: false },
    { id: 'NOT-002', title: 'Siaga Banjir', message: 'Curah hujan meningkat. Tinggi air mendekati level siaga.', type: 'alert', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false },
    { id: 'NOT-003', title: 'Perangkat Offline', message: 'Sensor Bendungan (DEV-003) tidak mengirim data selama 3 jam.', type: 'alert', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
    { id: 'NOT-004', title: 'Status Normal', message: 'Semua sensor menunjukkan level air dalam batas aman.', type: 'safe', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
    { id: 'NOT-005', title: 'Siaga Hujan Lebat', message: 'BMKG memprediksi hujan lebat dalam 6 jam ke depan.', type: 'alert', timestamp: new Date(Date.now() - 10800000).toISOString(), read: true },
];
export const predictions = timestamps24h.map((ts, i) => {
    const actual = rand(20, 180);
    const predicted = actual + rand(-15, 15);
    return {
        timestamp: ts,
        actual,
        predicted: Math.max(0, predicted),
        confidence: rand(72, 98),
        status: getStatus(predicted),
    };
});
export const confusionMatrix = {
    labels: ['Aman', 'Siaga', 'Bahaya'],
    data: [
        [47, 4, 0],
        [3, 41, 2],
        [1, 4, 30],
    ],
};
// Current status
export const currentStatus = {
    status: 'alert',
    waterLevel: 142.5,
    rainfall: 45.2,
    devicesOnline: devices.filter(d => d.status === 'online').length,
    devicesTotal: devices.length,
    todayNotifications: notifications.filter(n => {
        const today = new Date();
        const nDate = new Date(n.timestamp);
        return nDate.toDateString() === today.toDateString();
    }).length,
    avgWaterLevel: Math.round(sensorData.reduce((s, r) => s + r.waterLevel, 0) / sensorData.length * 10) / 10,
};
// Chart data for water level trend
export const waterLevelChartData = sensorData.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    level: s.waterLevel,
}));
export const rainfallChartData = sensorData.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    rainfall: s.rainfall,
}));
