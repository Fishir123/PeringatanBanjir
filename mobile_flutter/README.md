# Peringatan Banjir Mobile (Flutter)

Aplikasi mobile (user view) untuk sistem monitoring banjir.

## Fitur User View
- **Beranda**: status banjir saat ini, ringkasan perangkat, notifikasi aktif, tren tinggi air.
- **Data Sensor**: daftar data sensor terbaru + pencarian + status online/offline perangkat.
- **Prediksi**: tampilan prediksi sederhana berbasis data terakhir (simulasi mobile view).
- **Notifikasi**: riwayat notifikasi peringatan banjir.

> Halaman admin seperti **manajemen user, perangkat, dan pengaturan integrasi API** tidak dimasukkan sesuai permintaan user view only.

## Struktur
- `lib/src/data`: service API + model data
- `lib/src/state`: state controller + auto refresh 5 detik
- `lib/src/ui`: halaman & komponen UI
- `lib/src/core`: theme, formatter, status, konfigurasi API

## Konfigurasi API
Default base URL ada di:

- `lib/src/core/api_config.dart`

Sekarang default **otomatis mengikuti platform**:
- Android emulator: `http://10.0.2.2:3000`
- Linux/Windows/macOS/iOS simulator: `http://127.0.0.1:3000`
- Web: `http://127.0.0.1:3000`

### Ganti base URL saat run (recommended)
Gunakan `--dart-define`:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000
```

Contoh:
- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- Device fisik: `http://<IP-LAN-KOMPUTER>:3000`

## Menjalankan
```bash
cd mobile_flutter
flutter pub get
flutter run
```

## Backend yang dibutuhkan
Backend endpoint yang dipakai mobile:
- `GET /api/sensor-data`
- `GET /api/sensor-data/latest`

Pastikan backend dari project root sudah berjalan di port yang sesuai.

## Validasi
Proyek sudah dicek dengan:
- `flutter analyze` ✅
- `flutter test` ✅
