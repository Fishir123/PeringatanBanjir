-- ============================================================================
-- FloodGuard Desa - Database Schema
-- Sistem Peringatan Dini Banjir Berbasis IoT dan Machine Learning
-- Desa Patean, Kabupaten Sumenep
-- ============================================================================
-- 
-- Cara Penggunaan:
-- mysql -u root -p < database/schema.sql
--
-- PERINGATAN: Script ini akan MENGHAPUS database yang sudah ada!
-- ============================================================================

-- Hapus database jika sudah ada (fresh start)
DROP DATABASE IF EXISTS peringatan_banjir;

-- Buat database baru
CREATE DATABASE peringatan_banjir
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peringatan_banjir;

-- ============================================================================
-- BAGIAN 1: STRUKTUR TABEL
-- ============================================================================

-- ============================================================================
-- TABEL 1: admins
-- Manajemen admin sistem
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin', 'operator') NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 2: devices
-- Data perangkat sensor IoT (ultrasonik) yang terpasang
-- ============================================================================
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Threshold ketinggian air (dalam cm dari dasar sungai)
  threshold_safe DECIMAL(10, 2) DEFAULT 100.00,
  threshold_warning DECIMAL(10, 2) DEFAULT 150.00,
  threshold_danger DECIMAL(10, 2) DEFAULT 200.00,
  threshold_critical DECIMAL(10, 2) DEFAULT 250.00,
  
  -- Konfigurasi sensor
  sensor_height_cm DECIMAL(10, 2),          -- Tinggi sensor dari dasar sungai
  max_distance_cm DECIMAL(10, 2),           -- Jarak maksimal pembacaan sensor
  reading_interval_sec INT UNSIGNED DEFAULT 300, -- Interval pembacaan (detik)
  
  status ENUM('active', 'inactive', 'maintenance', 'offline') NOT NULL DEFAULT 'active',
  installed_at DATE,
  last_maintenance DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 3: sensor_data
-- Data ketinggian air real-time dari sensor ultrasonik
-- ============================================================================
CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id VARCHAR(50) NOT NULL,
  
  -- Data pengukuran
  water_level DECIMAL(10, 2) NOT NULL,      -- Ketinggian air (cm)
  distance_cm DECIMAL(10, 2),               -- Jarak ultrasonik mentah (cm)
  
  -- Status perangkat
  battery_level TINYINT UNSIGNED,           -- Level baterai (0-100%)
  signal_strength TINYINT,                  -- Kekuatan sinyal WiFi/LoRa (dBm)
  
  -- Status ketinggian air saat pengukuran
  water_status ENUM('safe', 'warning', 'danger', 'critical') DEFAULT 'safe',
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_device_id (device_id),
  INDEX idx_created_at (created_at),
  INDEX idx_device_created (device_id, created_at),
  INDEX idx_water_status (water_status),
  CONSTRAINT fk_sensor_device FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 4: weather_data
-- Data cuaca dan curah hujan dari BMKG
-- ============================================================================
CREATE TABLE IF NOT EXISTS weather_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Data cuaca
  rainfall_mm DECIMAL(10, 2),               -- Curah hujan (mm)
  humidity DECIMAL(5, 2),                   -- Kelembaban (%)
  temperature DECIMAL(5, 2),                -- Suhu (°C)
  wind_speed DECIMAL(6, 2),                 -- Kecepatan angin (km/jam)
  wind_direction VARCHAR(10),               -- Arah angin (N, NE, E, SE, S, SW, W, NW)
  
  -- Kode dan deskripsi cuaca BMKG
  weather_code VARCHAR(20),
  weather_desc VARCHAR(100),
  
  -- Waktu data
  forecast_date DATE NOT NULL,
  forecast_hour TINYINT UNSIGNED,           -- Jam prediksi (0-23)
  
  -- Intensitas hujan
  rain_intensity ENUM('none', 'light', 'moderate', 'heavy', 'very_heavy') DEFAULT 'none',
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'BMKG',
  location_code VARCHAR(20),                -- Kode lokasi BMKG
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_forecast_date (forecast_date),
  INDEX idx_forecast_datetime (forecast_date, forecast_hour),
  INDEX idx_recorded_at (recorded_at),
  INDEX idx_rain_intensity (rain_intensity)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 5: tidal_data
-- Data pasang surut air laut dari BMKG
-- ============================================================================
CREATE TABLE IF NOT EXISTS tidal_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Data pasang surut
  tide_level_cm DECIMAL(10, 2),             -- Ketinggian pasut (cm)
  tide_status ENUM('high', 'low', 'rising', 'falling') NOT NULL,
  
  -- Waktu pasang surut
  high_tide_time TIME,                      -- Waktu pasang tertinggi
  high_tide_level_cm DECIMAL(10, 2),        -- Level pasang tertinggi
  low_tide_time TIME,                       -- Waktu surut terendah
  low_tide_level_cm DECIMAL(10, 2),         -- Level surut terendah
  
  -- Tanggal prediksi
  prediction_date DATE NOT NULL,
  
  -- Kondisi khusus
  is_spring_tide BOOLEAN DEFAULT FALSE,     -- Pasang purnama
  is_neap_tide BOOLEAN DEFAULT FALSE,       -- Pasang perbani
  moon_phase VARCHAR(20),                   -- Fase bulan
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'BMKG',
  station_code VARCHAR(20),                 -- Kode stasiun pasut
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_prediction_date (prediction_date),
  INDEX idx_tide_status (tide_status),
  INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 6: flood_predictions
-- Hasil prediksi Machine Learning
-- ============================================================================
CREATE TABLE IF NOT EXISTS flood_predictions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id VARCHAR(50),
  
  -- Waktu prediksi
  prediction_time DATETIME NOT NULL,        -- Kapan banjir diprediksi terjadi
  prediction_window_hours INT DEFAULT 24,   -- Jendela prediksi (jam)
  
  -- Hasil prediksi
  flood_probability DECIMAL(5, 4),          -- Probabilitas banjir (0.0000 - 1.0000)
  predicted_level_cm DECIMAL(10, 2),        -- Prediksi ketinggian air
  risk_level ENUM('safe', 'low', 'medium', 'high', 'critical') NOT NULL,
  
  -- Estimasi dampak
  estimated_affected_area VARCHAR(100),     -- Area terdampak
  estimated_duration_hours INT,             -- Estimasi durasi banjir
  
  -- Informasi model ML
  model_version VARCHAR(20),                -- Versi model ML
  model_name VARCHAR(50),                   -- Nama model (RF, LSTM, dll)
  features_used JSON,                       -- Fitur yang digunakan
  confidence_score DECIMAL(5, 4),           -- Tingkat keyakinan model
  
  -- Data input untuk prediksi
  input_water_level DECIMAL(10, 2),         -- Level air saat prediksi
  input_rainfall_mm DECIMAL(10, 2),         -- Curah hujan input
  input_tide_level_cm DECIMAL(10, 2),       -- Level pasut input
  
  -- Flag
  is_backwater_risk BOOLEAN DEFAULT FALSE,  -- Risiko backwater
  is_validated BOOLEAN DEFAULT FALSE,       -- Sudah divalidasi
  actual_outcome ENUM('true_positive', 'false_positive', 'true_negative', 'false_negative'),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_device_id (device_id),
  INDEX idx_prediction_time (prediction_time),
  INDEX idx_risk_level (risk_level),
  INDEX idx_created_at (created_at),
  INDEX idx_model_version (model_version),
  CONSTRAINT fk_prediction_device FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 7: alerts
-- Peringatan banjir yang digenerate sistem
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prediction_id BIGINT UNSIGNED,
  device_id VARCHAR(50),
  
  -- Level dan tipe peringatan
  alert_level TINYINT UNSIGNED NOT NULL,    -- 1=siaga, 2=awas, 3=bahaya
  alert_type ENUM('prediction', 'realtime', 'manual', 'test') NOT NULL DEFAULT 'realtime',
  
  -- Konten peringatan
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,                      -- Saran tindakan untuk warga
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_sent_web BOOLEAN NOT NULL DEFAULT FALSE,
  is_sent_mobile BOOLEAN NOT NULL DEFAULT FALSE,
  sent_web_at DATETIME,
  sent_mobile_at DATETIME,
  
  -- Waktu berlaku
  valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  
  -- Metadata
  triggered_by VARCHAR(50),                 -- Apa yang memicu alert
  acknowledged_by INT UNSIGNED,             -- Admin yang acknowledge
  acknowledged_at DATETIME,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_alert_level (alert_level),
  INDEX idx_alert_type (alert_type),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  INDEX idx_prediction_id (prediction_id),
  CONSTRAINT fk_alert_prediction FOREIGN KEY (prediction_id) REFERENCES flood_predictions(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_alert_device FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_alert_admin FOREIGN KEY (acknowledged_by) REFERENCES admins(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 8: push_tokens
-- Token untuk push notification (FCM/Web Push)
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Token info
  token VARCHAR(500) NOT NULL,
  platform ENUM('web', 'android', 'ios') NOT NULL,
  
  -- Device info
  device_name VARCHAR(100),
  device_model VARCHAR(100),
  os_version VARCHAR(50),
  app_version VARCHAR(20),
  
  -- Subscription info (untuk web push)
  endpoint TEXT,
  p256dh_key VARCHAR(255),
  auth_key VARCHAR(255),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at DATETIME,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX idx_token (token(255)),
  INDEX idx_platform (platform),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 9: alert_logs
-- Log pengiriman notifikasi
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  alert_id BIGINT UNSIGNED NOT NULL,
  push_token_id BIGINT UNSIGNED,
  
  -- Status pengiriman
  status ENUM('pending', 'sent', 'delivered', 'failed', 'expired') NOT NULL DEFAULT 'pending',
  
  -- Detail pengiriman
  platform ENUM('web', 'android', 'ios'),
  provider VARCHAR(50),                     -- FCM, APNS, WebPush
  provider_message_id VARCHAR(255),         -- Message ID dari provider
  
  -- Error handling
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count TINYINT UNSIGNED DEFAULT 0,
  
  -- Waktu
  sent_at DATETIME,
  delivered_at DATETIME,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_alert_id (alert_id),
  INDEX idx_push_token_id (push_token_id),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at),
  CONSTRAINT fk_log_alert FOREIGN KEY (alert_id) REFERENCES alerts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_log_token FOREIGN KEY (push_token_id) REFERENCES push_tokens(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 10: evacuation_points
-- Titik-titik evakuasi
-- ============================================================================
CREATE TABLE IF NOT EXISTS evacuation_points (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Informasi lokasi
  name VARCHAR(100) NOT NULL,
  type ENUM('balai_desa', 'sekolah', 'masjid', 'lapangan', 'gedung', 'other') NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Kapasitas dan fasilitas
  capacity INT UNSIGNED,                    -- Kapasitas orang
  facilities JSON,                          -- ["toilet", "dapur", "listrik", "air_bersih"]
  
  -- Kontak
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  
  -- Aksesibilitas
  accessibility_notes TEXT,                 -- Catatan akses (jalan rusak, dll)
  elevation_m DECIMAL(8, 2),                -- Ketinggian dari permukaan laut
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified DATE,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_type (type),
  INDEX idx_is_active (is_active),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 11: emergency_contacts
-- Kontak darurat (RT/RW, relawan, instansi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Informasi kontak
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),                        -- Kepala Desa, RT, RW, dll
  organization VARCHAR(100),                -- BPBD, PMI, dll
  
  -- Nomor telepon
  phone VARCHAR(20) NOT NULL,
  phone_alt VARCHAR(20),                    -- Nomor alternatif
  whatsapp VARCHAR(20),
  
  -- Kategori
  category ENUM('pemerintah', 'rt_rw', 'relawan', 'medis', 'keamanan', 'other') NOT NULL,
  
  -- Prioritas
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  priority TINYINT UNSIGNED DEFAULT 0,      -- 0 = tertinggi
  
  -- Area tanggung jawab
  coverage_area VARCHAR(100),               -- RT 01, Dusun A, dll
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_available_24h BOOLEAN DEFAULT FALSE,
  available_hours VARCHAR(50),              -- "08:00-17:00"
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 12: system_settings
-- Konfigurasi sistem
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT,
  `type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Bisa diakses tanpa auth
  updated_by INT UNSIGNED,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`),
  INDEX idx_category (category),
  CONSTRAINT fk_settings_admin FOREIGN KEY (updated_by) REFERENCES admins(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- TABEL 13: data_cleanup_logs
-- Log pembersihan data otomatis
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_cleanup_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  table_name VARCHAR(50) NOT NULL,
  records_deleted INT UNSIGNED NOT NULL DEFAULT 0,
  retention_days INT UNSIGNED NOT NULL,
  cleanup_date DATE NOT NULL,
  execution_time_ms INT UNSIGNED,
  status ENUM('success', 'failed', 'partial') NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_table_name (table_name),
  INDEX idx_cleanup_date (cleanup_date)
) ENGINE=InnoDB;

-- ============================================================================
-- BAGIAN 2: VIEWS
-- ============================================================================

-- View: Data sensor terbaru per device
CREATE OR REPLACE VIEW v_latest_sensor_data AS
SELECT 
  s.id,
  s.device_id,
  d.name AS device_name,
  d.location_name,
  s.water_level,
  s.distance_cm,
  s.battery_level,
  s.signal_strength,
  s.water_status,
  s.created_at,
  d.threshold_warning,
  d.threshold_danger,
  d.threshold_critical
FROM sensor_data s
INNER JOIN devices d ON s.device_id = d.id
INNER JOIN (
  SELECT device_id, MAX(created_at) AS max_created_at
  FROM sensor_data
  GROUP BY device_id
) latest ON s.device_id = latest.device_id AND s.created_at = latest.max_created_at
WHERE d.status = 'active';

-- View: Alert aktif
CREATE OR REPLACE VIEW v_active_alerts AS
SELECT 
  a.id,
  a.alert_level,
  CASE a.alert_level 
    WHEN 1 THEN 'SIAGA'
    WHEN 2 THEN 'AWAS'
    WHEN 3 THEN 'BAHAYA'
  END AS alert_level_name,
  a.alert_type,
  a.title,
  a.message,
  a.recommendation,
  a.device_id,
  d.name AS device_name,
  d.location_name,
  a.created_at,
  a.expires_at
FROM alerts a
LEFT JOIN devices d ON a.device_id = d.id
WHERE a.is_active = TRUE
  AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY a.alert_level DESC, a.created_at DESC;

-- View: Statistik harian sensor
CREATE OR REPLACE VIEW v_daily_sensor_stats AS
SELECT 
  device_id,
  DATE(created_at) AS date,
  COUNT(*) AS reading_count,
  MIN(water_level) AS min_level,
  MAX(water_level) AS max_level,
  AVG(water_level) AS avg_level,
  AVG(battery_level) AS avg_battery
FROM sensor_data
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY device_id, DATE(created_at)
ORDER BY date DESC, device_id;

-- View: Risiko backwater (curah hujan tinggi + pasang tinggi)
CREATE OR REPLACE VIEW v_backwater_risk AS
SELECT 
  w.forecast_date,
  w.forecast_hour,
  w.rainfall_mm,
  w.rain_intensity,
  t.tide_status,
  t.tide_level_cm,
  t.high_tide_time,
  CASE 
    WHEN w.rain_intensity IN ('heavy', 'very_heavy') AND t.tide_status = 'high' THEN 'HIGH'
    WHEN w.rain_intensity = 'moderate' AND t.tide_status = 'high' THEN 'MEDIUM'
    WHEN w.rain_intensity IN ('heavy', 'very_heavy') AND t.tide_status = 'rising' THEN 'MEDIUM'
    ELSE 'LOW'
  END AS backwater_risk
FROM weather_data w
INNER JOIN tidal_data t ON w.forecast_date = t.prediction_date
WHERE w.forecast_date >= CURRENT_DATE
ORDER BY w.forecast_date, w.forecast_hour;

-- ============================================================================
-- BAGIAN 3: SEED DATA (DATA AWAL)
-- ============================================================================

-- ============================================================================
-- 3.1 ADMIN DEFAULT
-- Password: admin123 (hash dengan bcrypt, ganti di production!)
-- Untuk generate hash: https://bcrypt-generator.com/ atau gunakan bcrypt di Node.js
-- ============================================================================
INSERT INTO admins (username, password_hash, email, full_name, phone, role, is_active) VALUES
('admin', '$2b$10$rQZ8K8Y8Y8Y8Y8Y8Y8Y8YOeJ7J7J7J7J7J7J7J7J7J7J7J7J7J7J7', 'admin@floodguard.desa.id', 'Administrator FloodGuard', '081234567890', 'super_admin', TRUE),
('operator1', '$2b$10$rQZ8K8Y8Y8Y8Y8Y8Y8Y8YOeJ7J7J7J7J7J7J7J7J7J7J7J7J7J7J7', 'operator@floodguard.desa.id', 'Operator Desa Patean', '081234567891', 'operator', TRUE);

-- ============================================================================
-- 3.2 DEVICES (SENSOR IoT)
-- Sensor ultrasonik di titik-titik rawan banjir Desa Patean
-- ============================================================================
INSERT INTO devices (id, name, description, location_name, latitude, longitude, 
  threshold_safe, threshold_warning, threshold_danger, threshold_critical,
  sensor_height_cm, max_distance_cm, reading_interval_sec, status, installed_at) VALUES

('SENSOR-001', 'Sensor Jembatan Utama', 
  'Sensor ultrasonik di bawah jembatan utama Desa Patean', 
  'Jembatan Utama Sungai Patean',
  -7.0425, 113.8672,
  100.00, 150.00, 200.00, 250.00,
  300.00, 400.00, 300,
  'active', '2025-01-01'),

('SENSOR-002', 'Sensor Hulu Sungai', 
  'Sensor di bagian hulu sungai untuk deteksi dini', 
  'Hulu Sungai Patean - Dusun Tengah',
  -7.0398, 113.8645,
  80.00, 120.00, 160.00, 200.00,
  250.00, 350.00, 300,
  'active', '2025-01-01'),

('SENSOR-003', 'Sensor Muara Sungai', 
  'Sensor di muara untuk deteksi backwater', 
  'Muara Sungai Patean - Pesisir',
  -7.0456, 113.8701,
  120.00, 180.00, 240.00, 300.00,
  350.00, 450.00, 300,
  'active', '2025-01-01'),

('SENSOR-004', 'Sensor Saluran Irigasi', 
  'Sensor di saluran irigasi utama desa', 
  'Saluran Irigasi Dusun Barat',
  -7.0412, 113.8658,
  60.00, 90.00, 120.00, 150.00,
  200.00, 300.00, 300,
  'active', '2025-01-15');

-- ============================================================================
-- 3.3 EVACUATION POINTS (TITIK EVAKUASI)
-- Lokasi evakuasi di Desa Patean
-- ============================================================================
INSERT INTO evacuation_points (name, type, address, latitude, longitude, 
  capacity, facilities, contact_person, contact_phone, elevation_m, is_active, last_verified) VALUES

('Balai Desa Patean', 'balai_desa', 
  'Jl. Raya Patean No. 1, Desa Patean, Kec. Batang-Batang, Kab. Sumenep',
  -7.0410, 113.8665,
  200,
  '["toilet", "dapur", "listrik", "air_bersih", "p3k", "ruang_tidur"]',
  'Bapak Kepala Desa', '081234500001',
  15.5, TRUE, '2025-03-01'),

('SDN Patean 1', 'sekolah',
  'Jl. Pendidikan No. 5, Dusun Tengah, Desa Patean',
  -7.0405, 113.8670,
  300,
  '["toilet", "listrik", "air_bersih", "lapangan"]',
  'Bapak Kepala Sekolah', '081234500002',
  12.0, TRUE, '2025-03-01'),

('Masjid Al-Ikhlas', 'masjid',
  'Jl. Masjid No. 10, Dusun Timur, Desa Patean',
  -7.0418, 113.8680,
  150,
  '["toilet", "listrik", "air_bersih", "tempat_wudhu"]',
  'Bapak Takmir Masjid', '081234500003',
  14.0, TRUE, '2025-03-01'),

('Lapangan Desa Patean', 'lapangan',
  'Jl. Raya Patean, Desa Patean',
  -7.0400, 113.8660,
  500,
  '["lapangan_terbuka", "akses_kendaraan"]',
  'Sekretaris Desa', '081234500004',
  11.0, TRUE, '2025-03-01'),

('Gedung Serbaguna Kecamatan', 'gedung',
  'Jl. Kecamatan No. 1, Batang-Batang',
  -7.0380, 113.8640,
  400,
  '["toilet", "dapur", "listrik", "air_bersih", "p3k", "ruang_tidur", "panggung"]',
  'Camat Batang-Batang', '081234500005',
  18.0, TRUE, '2025-02-15'),

('Mushola Ar-Rahman Dusun Barat', 'masjid',
  'Dusun Barat RT 03, Desa Patean',
  -7.0420, 113.8650,
  80,
  '["toilet", "listrik", "tempat_wudhu"]',
  'Ketua RT 03', '081234500006',
  13.5, TRUE, '2025-03-01');

-- ============================================================================
-- 3.4 EMERGENCY CONTACTS (KONTAK DARURAT)
-- Kontak penting untuk situasi darurat
-- ============================================================================
INSERT INTO emergency_contacts (name, role, organization, phone, phone_alt, whatsapp, 
  category, is_primary, priority, coverage_area, is_active, is_available_24h, available_hours) VALUES

-- Pemerintah Desa
('H. Ahmad Sulaiman', 'Kepala Desa', 'Pemerintah Desa Patean', 
  '081234567001', '081234567002', '081234567001',
  'pemerintah', TRUE, 0, 'Seluruh Desa Patean', TRUE, TRUE, NULL),

('Moh. Faisal', 'Sekretaris Desa', 'Pemerintah Desa Patean',
  '081234567003', NULL, '081234567003',
  'pemerintah', FALSE, 1, 'Seluruh Desa Patean', TRUE, FALSE, '08:00-17:00'),

-- RT/RW
('Abdul Karim', 'Ketua RT 01', 'RT 01 Dusun Tengah',
  '081234567010', NULL, '081234567010',
  'rt_rw', FALSE, 2, 'RT 01 Dusun Tengah', TRUE, TRUE, NULL),

('Samsul Arifin', 'Ketua RT 02', 'RT 02 Dusun Tengah',
  '081234567011', NULL, '081234567011',
  'rt_rw', FALSE, 2, 'RT 02 Dusun Tengah', TRUE, TRUE, NULL),

('Hasan Basri', 'Ketua RT 03', 'RT 03 Dusun Barat',
  '081234567012', NULL, '081234567012',
  'rt_rw', FALSE, 2, 'RT 03 Dusun Barat', TRUE, TRUE, NULL),

('Moh. Ridwan', 'Ketua RW 01', 'RW 01 Desa Patean',
  '081234567020', NULL, '081234567020',
  'rt_rw', FALSE, 1, 'RW 01 (Dusun Tengah & Barat)', TRUE, TRUE, NULL),

-- Instansi Darurat
('Posko BPBD Sumenep', 'Posko Darurat', 'BPBD Kabupaten Sumenep',
  '0328-123456', '0328-123457', NULL,
  'pemerintah', TRUE, 0, 'Kabupaten Sumenep', TRUE, TRUE, NULL),

('Puskesmas Batang-Batang', 'Layanan Kesehatan', 'Dinas Kesehatan',
  '0328-234567', NULL, NULL,
  'medis', TRUE, 0, 'Kec. Batang-Batang', TRUE, TRUE, NULL),

('Polsek Batang-Batang', 'Keamanan', 'Kepolisian',
  '0328-345678', '110', NULL,
  'keamanan', FALSE, 1, 'Kec. Batang-Batang', TRUE, TRUE, NULL),

('Koramil Batang-Batang', 'Keamanan', 'TNI AD',
  '0328-456789', NULL, NULL,
  'keamanan', FALSE, 2, 'Kec. Batang-Batang', TRUE, TRUE, NULL),

-- Relawan
('Tim SAR Desa Patean', 'Koordinator Relawan', 'Relawan SAR Desa',
  '081234567100', NULL, '081234567100',
  'relawan', TRUE, 0, 'Desa Patean', TRUE, TRUE, NULL),

('Karang Taruna Patean', 'Ketua', 'Karang Taruna',
  '081234567101', NULL, '081234567101',
  'relawan', FALSE, 1, 'Desa Patean', TRUE, FALSE, '06:00-22:00'),

('PMI Cabang Sumenep', 'Hotline', 'Palang Merah Indonesia',
  '0328-567890', NULL, NULL,
  'medis', FALSE, 1, 'Kabupaten Sumenep', TRUE, TRUE, NULL);

-- ============================================================================
-- 3.5 SYSTEM SETTINGS (KONFIGURASI SISTEM)
-- Pengaturan default sistem
-- ============================================================================
INSERT INTO system_settings (`key`, `value`, `type`, description, category, is_public) VALUES

-- Informasi Desa
('village_name', 'Desa Patean', 'string', 'Nama desa', 'general', TRUE),
('village_district', 'Kecamatan Batang-Batang', 'string', 'Nama kecamatan', 'general', TRUE),
('village_regency', 'Kabupaten Sumenep', 'string', 'Nama kabupaten', 'general', TRUE),
('village_province', 'Jawa Timur', 'string', 'Nama provinsi', 'general', TRUE),
('village_latitude', '-7.0410', 'number', 'Latitude pusat desa', 'general', TRUE),
('village_longitude', '113.8665', 'number', 'Longitude pusat desa', 'general', TRUE),

-- Konfigurasi Sensor
('sensor_reading_interval', '300', 'number', 'Interval pembacaan sensor dalam detik', 'sensor', FALSE),
('sensor_offline_threshold', '900', 'number', 'Waktu (detik) sebelum sensor dianggap offline', 'sensor', FALSE),
('sensor_battery_warning', '20', 'number', 'Level baterai untuk peringatan (persen)', 'sensor', FALSE),

-- Konfigurasi Alert
('alert_siaga_threshold', '1', 'number', 'Level alert SIAGA', 'alert', FALSE),
('alert_awas_threshold', '2', 'number', 'Level alert AWAS', 'alert', FALSE),
('alert_bahaya_threshold', '3', 'number', 'Level alert BAHAYA', 'alert', FALSE),
('alert_auto_expire_hours', '24', 'number', 'Waktu kadaluarsa alert otomatis (jam)', 'alert', FALSE),
('alert_cooldown_minutes', '30', 'number', 'Jeda minimal antar alert yang sama (menit)', 'alert', FALSE),

-- Konfigurasi Notifikasi
('notification_enabled', 'true', 'boolean', 'Aktifkan push notification', 'notification', FALSE),
('notification_sound_enabled', 'true', 'boolean', 'Aktifkan suara notifikasi', 'notification', FALSE),
('fcm_server_key', '', 'string', 'Firebase Cloud Messaging Server Key', 'notification', FALSE),
('vapid_public_key', '', 'string', 'VAPID Public Key untuk Web Push', 'notification', FALSE),
('vapid_private_key', '', 'string', 'VAPID Private Key untuk Web Push', 'notification', FALSE),

-- Konfigurasi BMKG
('bmkg_api_enabled', 'true', 'boolean', 'Aktifkan integrasi BMKG API', 'bmkg', FALSE),
('bmkg_location_code', '97.73.04', 'string', 'Kode lokasi BMKG untuk Sumenep', 'bmkg', FALSE),
('bmkg_fetch_interval', '3600', 'number', 'Interval fetch data BMKG (detik)', 'bmkg', FALSE),
('bmkg_tidal_station', 'sumenep', 'string', 'Kode stasiun pasut terdekat', 'bmkg', FALSE),

-- Konfigurasi ML
('ml_enabled', 'true', 'boolean', 'Aktifkan prediksi Machine Learning', 'ml', FALSE),
('ml_model_version', 'v1.0.0', 'string', 'Versi model ML aktif', 'ml', FALSE),
('ml_prediction_interval', '3600', 'number', 'Interval prediksi ML (detik)', 'ml', FALSE),
('ml_confidence_threshold', '0.7', 'number', 'Threshold confidence untuk trigger alert', 'ml', FALSE),
('ml_backwater_weight', '1.5', 'number', 'Bobot risiko backwater dalam model', 'ml', FALSE),

-- Konfigurasi Data Retention
('retention_sensor_days', '30', 'number', 'Hari penyimpanan data sensor', 'retention', FALSE),
('retention_weather_days', '30', 'number', 'Hari penyimpanan data cuaca', 'retention', FALSE),
('retention_tidal_days', '30', 'number', 'Hari penyimpanan data pasut', 'retention', FALSE),
('retention_prediction_days', '60', 'number', 'Hari penyimpanan data prediksi', 'retention', FALSE),
('retention_alert_log_days', '90', 'number', 'Hari penyimpanan log alert', 'retention', FALSE),

-- Pesan Template
('msg_siaga_template', 'PERINGATAN SIAGA: Ketinggian air di {location} mencapai {level} cm. Harap waspada dan pantau informasi selanjutnya.', 'string', 'Template pesan SIAGA', 'template', FALSE),
('msg_awas_template', 'PERINGATAN AWAS: Ketinggian air di {location} mencapai {level} cm. Siapkan barang penting dan bersiap evakuasi.', 'string', 'Template pesan AWAS', 'template', FALSE),
('msg_bahaya_template', 'PERINGATAN BAHAYA: Ketinggian air di {location} mencapai {level} cm. SEGERA EVAKUASI ke titik aman terdekat!', 'string', 'Template pesan BAHAYA', 'template', FALSE),
('msg_prediction_template', 'PREDIKSI BANJIR: Sistem memprediksi potensi banjir pada {time} dengan probabilitas {probability}%. Harap bersiap.', 'string', 'Template pesan prediksi', 'template', FALSE),

-- Info Sistem
('system_version', '1.0.0', 'string', 'Versi sistem FloodGuard', 'system', TRUE),
('system_name', 'FloodGuard Desa', 'string', 'Nama sistem', 'system', TRUE),
('maintenance_mode', 'false', 'boolean', 'Mode maintenance', 'system', TRUE);

-- ============================================================================
-- 3.6 SAMPLE DATA (untuk testing)
-- Data contoh sensor untuk demo
-- ============================================================================

-- Sample sensor data (kondisi normal)
INSERT INTO sensor_data (device_id, water_level, distance_cm, battery_level, signal_strength, water_status, created_at) VALUES
('SENSOR-001', 85.50, 214.50, 95, -45, 'safe', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('SENSOR-001', 86.00, 214.00, 95, -44, 'safe', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('SENSOR-001', 84.75, 215.25, 95, -46, 'safe', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('SENSOR-002', 62.30, 187.70, 88, -52, 'safe', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('SENSOR-002', 61.80, 188.20, 88, -51, 'safe', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('SENSOR-003', 95.20, 254.80, 72, -60, 'safe', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('SENSOR-003', 96.10, 253.90, 72, -59, 'safe', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('SENSOR-004', 45.00, 155.00, 100, -40, 'safe', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- Sample weather data
INSERT INTO weather_data (rainfall_mm, humidity, temperature, wind_speed, wind_direction, 
  weather_code, weather_desc, forecast_date, forecast_hour, rain_intensity, source, location_code) VALUES
(0.0, 75.5, 28.5, 12.0, 'E', '1', 'Cerah', CURRENT_DATE, 6, 'none', 'BMKG', '97.73.04'),
(0.0, 78.2, 30.2, 10.5, 'E', '1', 'Cerah', CURRENT_DATE, 9, 'none', 'BMKG', '97.73.04'),
(2.5, 82.0, 31.0, 8.0, 'SE', '3', 'Berawan', CURRENT_DATE, 12, 'light', 'BMKG', '97.73.04'),
(15.0, 88.5, 29.0, 15.0, 'SE', '60', 'Hujan Ringan', CURRENT_DATE, 15, 'light', 'BMKG', '97.73.04'),
(5.0, 85.0, 27.5, 10.0, 'E', '3', 'Berawan', CURRENT_DATE, 18, 'light', 'BMKG', '97.73.04'),
(0.0, 80.0, 26.0, 8.0, 'N', '1', 'Cerah', CURRENT_DATE, 21, 'none', 'BMKG', '97.73.04');

-- Sample tidal data
INSERT INTO tidal_data (tide_level_cm, tide_status, high_tide_time, high_tide_level_cm, 
  low_tide_time, low_tide_level_cm, prediction_date, moon_phase, source, station_code) VALUES
(85.0, 'rising', '06:30:00', 120.0, '12:45:00', 30.0, CURRENT_DATE, 'waxing_crescent', 'BMKG', 'sumenep'),
(120.0, 'high', '06:30:00', 120.0, '12:45:00', 30.0, CURRENT_DATE, 'waxing_crescent', 'BMKG', 'sumenep'),
(75.0, 'falling', '06:30:00', 120.0, '12:45:00', 30.0, CURRENT_DATE, 'waxing_crescent', 'BMKG', 'sumenep'),
(30.0, 'low', '06:30:00', 120.0, '12:45:00', 30.0, CURRENT_DATE, 'waxing_crescent', 'BMKG', 'sumenep'),
(90.0, 'rising', '18:45:00', 115.0, '00:30:00', 35.0, CURRENT_DATE, 'waxing_crescent', 'BMKG', 'sumenep');

-- ============================================================================
-- BAGIAN 4: STORED PROCEDURES & EVENT SCHEDULER
-- Auto-cleanup data berdasarkan retention policy (30 hari)
-- ============================================================================

-- Aktifkan Event Scheduler
-- Pastikan event_scheduler aktif di MariaDB
-- Tambahkan di my.cnf: event_scheduler=ON
-- Atau jalankan: SET GLOBAL event_scheduler = ON;
SET GLOBAL event_scheduler = ON;

DELIMITER //

-- Procedure untuk cleanup sensor_data
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_sensor_data()
BEGIN
    DECLARE v_retention_days INT DEFAULT 30;
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_execution_time INT;
    DECLARE v_status VARCHAR(20) DEFAULT 'success';
    DECLARE v_error_msg TEXT DEFAULT NULL;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_retention_days 
    FROM system_settings 
    WHERE `key` = 'retention_sensor_days';
    
    SET v_start_time = NOW();
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
            SET v_status = 'failed';
        END;
        
        DELETE FROM sensor_data 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL v_retention_days DAY);
        
        SET v_deleted_count = ROW_COUNT();
    END;
    
    SET v_execution_time = TIMESTAMPDIFF(MICROSECOND, v_start_time, NOW()) / 1000;
    
    INSERT INTO data_cleanup_logs (table_name, records_deleted, retention_days, cleanup_date, execution_time_ms, status, error_message)
    VALUES ('sensor_data', v_deleted_count, v_retention_days, CURRENT_DATE, v_execution_time, v_status, v_error_msg);
END //

-- Procedure untuk cleanup weather_data
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_weather_data()
BEGIN
    DECLARE v_retention_days INT DEFAULT 30;
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_execution_time INT;
    DECLARE v_status VARCHAR(20) DEFAULT 'success';
    DECLARE v_error_msg TEXT DEFAULT NULL;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_retention_days 
    FROM system_settings 
    WHERE `key` = 'retention_weather_days';
    
    SET v_start_time = NOW();
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
            SET v_status = 'failed';
        END;
        
        DELETE FROM weather_data 
        WHERE recorded_at < DATE_SUB(NOW(), INTERVAL v_retention_days DAY);
        
        SET v_deleted_count = ROW_COUNT();
    END;
    
    SET v_execution_time = TIMESTAMPDIFF(MICROSECOND, v_start_time, NOW()) / 1000;
    
    INSERT INTO data_cleanup_logs (table_name, records_deleted, retention_days, cleanup_date, execution_time_ms, status, error_message)
    VALUES ('weather_data', v_deleted_count, v_retention_days, CURRENT_DATE, v_execution_time, v_status, v_error_msg);
END //

-- Procedure untuk cleanup tidal_data
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_tidal_data()
BEGIN
    DECLARE v_retention_days INT DEFAULT 30;
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_execution_time INT;
    DECLARE v_status VARCHAR(20) DEFAULT 'success';
    DECLARE v_error_msg TEXT DEFAULT NULL;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_retention_days 
    FROM system_settings 
    WHERE `key` = 'retention_tidal_days';
    
    SET v_start_time = NOW();
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
            SET v_status = 'failed';
        END;
        
        DELETE FROM tidal_data 
        WHERE recorded_at < DATE_SUB(NOW(), INTERVAL v_retention_days DAY);
        
        SET v_deleted_count = ROW_COUNT();
    END;
    
    SET v_execution_time = TIMESTAMPDIFF(MICROSECOND, v_start_time, NOW()) / 1000;
    
    INSERT INTO data_cleanup_logs (table_name, records_deleted, retention_days, cleanup_date, execution_time_ms, status, error_message)
    VALUES ('tidal_data', v_deleted_count, v_retention_days, CURRENT_DATE, v_execution_time, v_status, v_error_msg);
END //

-- Procedure untuk cleanup flood_predictions
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_flood_predictions()
BEGIN
    DECLARE v_retention_days INT DEFAULT 60;
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_execution_time INT;
    DECLARE v_status VARCHAR(20) DEFAULT 'success';
    DECLARE v_error_msg TEXT DEFAULT NULL;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_retention_days 
    FROM system_settings 
    WHERE `key` = 'retention_prediction_days';
    
    SET v_start_time = NOW();
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
            SET v_status = 'failed';
        END;
        
        DELETE FROM flood_predictions 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL v_retention_days DAY);
        
        SET v_deleted_count = ROW_COUNT();
    END;
    
    SET v_execution_time = TIMESTAMPDIFF(MICROSECOND, v_start_time, NOW()) / 1000;
    
    INSERT INTO data_cleanup_logs (table_name, records_deleted, retention_days, cleanup_date, execution_time_ms, status, error_message)
    VALUES ('flood_predictions', v_deleted_count, v_retention_days, CURRENT_DATE, v_execution_time, v_status, v_error_msg);
END //

-- Procedure untuk cleanup alert_logs
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_alert_logs()
BEGIN
    DECLARE v_retention_days INT DEFAULT 90;
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_execution_time INT;
    DECLARE v_status VARCHAR(20) DEFAULT 'success';
    DECLARE v_error_msg TEXT DEFAULT NULL;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_retention_days 
    FROM system_settings 
    WHERE `key` = 'retention_alert_log_days';
    
    SET v_start_time = NOW();
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
            SET v_status = 'failed';
        END;
        
        DELETE FROM alert_logs 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL v_retention_days DAY);
        
        SET v_deleted_count = ROW_COUNT();
    END;
    
    SET v_execution_time = TIMESTAMPDIFF(MICROSECOND, v_start_time, NOW()) / 1000;
    
    INSERT INTO data_cleanup_logs (table_name, records_deleted, retention_days, cleanup_date, execution_time_ms, status, error_message)
    VALUES ('alert_logs', v_deleted_count, v_retention_days, CURRENT_DATE, v_execution_time, v_status, v_error_msg);
END //

-- Procedure untuk cleanup data_cleanup_logs sendiri (simpan 1 tahun)
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_cleanup_logs()
BEGIN
    DECLARE v_deleted_count INT DEFAULT 0;
    
    DELETE FROM data_cleanup_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
    
    SET v_deleted_count = ROW_COUNT();
END //

-- Master procedure untuk menjalankan semua cleanup
CREATE PROCEDURE IF NOT EXISTS sp_run_all_cleanup()
BEGIN
    CALL sp_cleanup_sensor_data();
    CALL sp_cleanup_weather_data();
    CALL sp_cleanup_tidal_data();
    CALL sp_cleanup_flood_predictions();
    CALL sp_cleanup_alert_logs();
    CALL sp_cleanup_cleanup_logs();
END //

-- Procedure untuk deaktivasi alert yang kadaluarsa
CREATE PROCEDURE IF NOT EXISTS sp_expire_old_alerts()
BEGIN
    UPDATE alerts 
    SET is_active = FALSE 
    WHERE is_active = TRUE 
      AND expires_at IS NOT NULL 
      AND expires_at < NOW();
END //

-- Procedure untuk menandai device offline
CREATE PROCEDURE IF NOT EXISTS sp_check_device_status()
BEGIN
    DECLARE v_offline_threshold INT DEFAULT 900;
    
    SELECT CAST(`value` AS UNSIGNED) INTO v_offline_threshold 
    FROM system_settings 
    WHERE `key` = 'sensor_offline_threshold';
    
    UPDATE devices d
    SET d.status = 'offline'
    WHERE d.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM sensor_data s 
        WHERE s.device_id = d.id 
          AND s.created_at > DATE_SUB(NOW(), INTERVAL v_offline_threshold SECOND)
      );
END //

DELIMITER ;

-- ============================================================================
-- EVENT SCHEDULERS
-- ============================================================================

-- Drop existing events jika ada
DROP EVENT IF EXISTS evt_daily_cleanup;
DROP EVENT IF EXISTS evt_expire_alerts;
DROP EVENT IF EXISTS evt_check_device_status;

-- Event: Cleanup harian (jalan setiap hari jam 02:00)
CREATE EVENT evt_daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CONCAT(CURRENT_DATE + INTERVAL 1 DAY, ' 02:00:00')
ON COMPLETION PRESERVE
ENABLE
COMMENT 'Membersihkan data lama sesuai retention policy'
DO
    CALL sp_run_all_cleanup();

-- Event: Expire alerts (jalan setiap 5 menit)
CREATE EVENT evt_expire_alerts
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
COMMENT 'Menonaktifkan alert yang sudah kadaluarsa'
DO
    CALL sp_expire_old_alerts();

-- Event: Check device status (jalan setiap 5 menit)
CREATE EVENT evt_check_device_status
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE
COMMENT 'Mengecek status device dan menandai offline'
DO
    CALL sp_check_device_status();

-- ============================================================================
-- QUERY UNTUK MONITORING (uncomment untuk testing)
-- ============================================================================

-- Cek status event scheduler
-- SHOW VARIABLES LIKE 'event_scheduler';

-- Lihat semua events
-- SHOW EVENTS FROM peringatan_banjir;

-- Lihat log cleanup
-- SELECT * FROM data_cleanup_logs ORDER BY created_at DESC LIMIT 20;

-- Manual trigger cleanup (untuk testing)
-- CALL sp_run_all_cleanup();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
