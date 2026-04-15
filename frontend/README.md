# DataStream Guardian Frontend

Frontend dashboard monitoring banjir berbasis React + Vite.

## Stack
- React 18
- Vite
- Tailwind CSS
- shadcn/ui
- React Query

## Menjalankan Dengan Backend Lokal

1. Jalankan backend dari folder root project:

```bash
cd ..
npm install
npm start
```

Backend aktif di `http://localhost:3000`.

2. Jalankan frontend:

```bash
npm install
npm run dev
```

Frontend aktif di `http://localhost:8080`.

Request `'/api/*'` dari frontend otomatis diproxy ke backend `http://localhost:3000` saat development.

## Build Production

```bash
npm run build
npm run preview
```

## Struktur Folder (dirapikan)

```text
src/
	features/
		sensor/
			api/           # komunikasi API sensor
			hooks/         # react-query hooks sensor
			utils/         # mapper/transformation data sensor
	shared/
		constants/       # konstanta global (status label, mapping)
```
