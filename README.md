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
