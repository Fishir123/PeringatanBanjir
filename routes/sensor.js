const express = require('express')
var router = express.Router();

// Simpan data sensor sementara (nanti bisa diganti dengan database)
let latestSensorData = {
    device_id: null,
    water_level: null,
    timestamp: null
};

// GET - ambil data sensor terbaru (untuk React)
router.get('/', (req, res) => {
    res.json(latestSensorData);
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

    // Simpan data sensor terbaru
    latestSensorData = {
        device_id,
        water_level,
        timestamp: new Date().toISOString()
    };

    res.json({
        message: "Data berhasil diterima", 
        data: latestSensorData
    })
})

module.exports = router