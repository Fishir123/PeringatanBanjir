# PeringatanBanjir

Backend API + Frontend dashboard sederhana untuk monitoring data sensor banjir.

## 1) Setup MySQL

Jalankan SQL berikut:

```sql
SOURCE database/schema.sql;
```

Atau copy isi `database/schema.sql` ke MySQL client.

## 2) Setup environment

```bash
cp .env.example .env
```

Edit `.env` sesuai kredensial MySQL kamu.

## 3) Install dependency

```bash
npm install
```

## 4) Jalankan server

```bash
npm start
```

Akses:
- Frontend: `http://localhost:3000`
- API all data: `http://localhost:3000/api/sensor-data`
- API latest: `http://localhost:3000/api/sensor-data/latest`

## 5) Contoh kirim data sensor

```bash
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"device_id":"sensor-01","water_level":92.5}'
```

## 6) MQTT dari ESP32

Subscriber backend otomatis subscribe ke dua pola topik:
- Legacy: `{MQTT_TOPIC_PREFIX}/sensor/{device_id}/data`
- Simple ESP32: `sensor/ultrasonic`

Payload minimal yang didukung untuk topik `sensor/ultrasonic`:

```json
{
  "device_id": "esp32-01",
  "distance_cm": 123.45
}
```

Catatan:
- Jika `water_level` tidak dikirim, backend akan pakai `distance_cm` sebagai `water_level` default.
- Untuk konversi ke level air sebenarnya, set `MQTT_SENSOR_HEIGHT_CM` di `.env`, maka rumusnya:
  `water_level = MQTT_SENSOR_HEIGHT_CM - distance_cm`
