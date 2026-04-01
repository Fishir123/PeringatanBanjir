const express = require('express')
var router = express.Router();

// In-memory storage (sementara, data hilang saat server restart)
let sensorDataStore = [];

// GET semua data sensor
router.get('/', (req, res) => {
    res.json({
        message: "Data sensor berhasil diambil",
        data: sensorDataStore
    });
});

// GET data sensor terbaru per device
router.get('/latest', (req, res) => {
    // Ambil data terbaru untuk setiap device
    const latestByDevice = {};
    
    sensorDataStore.forEach(item => {
        if (!latestByDevice[item.device_id] || 
            new Date(item.timestamp) > new Date(latestByDevice[item.device_id].timestamp)) {
            latestByDevice[item.device_id] = item;
        }
    });
    
    const latestData = Object.values(latestByDevice);
    
    res.json({
        message: "Data sensor terbaru berhasil diambil",
        data: latestData
    });
});

// GET data sensor berdasarkan device_id
router.get('/:device_id', (req, res) => {
    const { device_id } = req.params;
    const deviceData = sensorDataStore.filter(item => item.device_id === device_id);
    
    res.json({
        message: `Data sensor untuk device ${device_id}`,
        data: deviceData
    });
});

// POST - terima data dari wokwi
router.post('/', (req, res) => {
    const {device_id, water_level} = req.body

    console.log("Data dari sensor", req.body)

    if(!device_id || water_level === undefined) {
        return res.status(400).json({
            message: "Data tidak lengkap"
        })
    }

    // Simpan ke in-memory storage
    const newData = {
        id: sensorDataStore.length + 1,
        device_id,
        water_level: parseFloat(water_level),
        timestamp: new Date().toISOString()
    };
    
    sensorDataStore.push(newData);
    
    // Batasi storage maksimal 1000 data (opsional, untuk mencegah memory leak)
    if (sensorDataStore.length > 1000) {
        sensorDataStore = sensorDataStore.slice(-500);
    }

    res.json({
        message: "Data berhasil diterima", 
        data: newData
    })
})

module.exports = router
