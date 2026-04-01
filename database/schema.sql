CREATE DATABASE IF NOT EXISTS peringatan_banjir;
USE peringatan_banjir;

CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id VARCHAR(100) NOT NULL,
  water_level DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_device_id (device_id),
  INDEX idx_created_at (created_at)
);
