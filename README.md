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
