# PeringatanBanjir

Struktur project sudah dipisah menjadi:
- `backend/` untuk API + MQTT subscriber
- `frontend/` untuk aplikasi frontend

## 1) Setup MySQL

Jalankan SQL berikut:

```sql
SOURCE backend/database/schema.sql;
```

Atau copy isi `backend/database/schema.sql` ke MySQL client.

## 2) Setup environment (backend)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` sesuai kredensial MySQL kamu.

Tambahkan juga konfigurasi API eksternal untuk cuaca dan pasang surut:

```env
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
WEATHER_LOCATION_LAT=
WEATHER_LOCATION_LON=

TIDE_API_BASE_URL=
TIDE_API_KEY=
TIDE_STATION_CODE=
```

## 3) Install dependency

```bash
npm install --prefix backend
npm install --prefix frontend
```

## 4) Build frontend

```bash
npm run build --prefix frontend
```

## 5) Jalankan server backend

```bash
npm start --prefix backend
```

Akses:
- Frontend: `http://localhost:3000`
- API all data: `http://localhost:3000/api/sensor-data`
- API latest: `http://localhost:3000/api/sensor-data/latest`

## 6) API Integrasi Cuaca + Pasang Surut

Endpoint backend baru:

- `GET /api/external/config` ambil konfigurasi integrasi aktif
- `PUT /api/external/config` simpan konfigurasi dari frontend
- `POST /api/external/weather/fetch` fetch cuaca dari provider eksternal
- `POST /api/external/tide/fetch` fetch pasang surut dari provider eksternal
- `POST /api/external/fetch-all` fetch cuaca + pasang surut sekaligus

Semua endpoint di atas sudah terhubung ke halaman Pengaturan (`/settings`) agar URL API, API key, dan lokasi/stasiun bisa diubah langsung dari web.
