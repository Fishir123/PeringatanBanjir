/*
 * FloodGuard ESP32 - Contoh kode kirim data sensor ke API
 * Library yang dibutuhkan: WiFi, HTTPClient, ArduinoJson
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== KONFIGURASI =====
const char* WIFI_SSID     = "NamaWiFi";
const char* WIFI_PASSWORD = "PasswordWiFi";
const char* API_URL       = "http://192.168.1.100:3000/api/sensor";
const char* API_KEY       = "floodguard-secret-key-123";
const int   DEVICE_ID     = 1;       // ID unik tiap ESP32
const int   INTERVAL_MS   = 60000;   // Kirim setiap 60 detik

// ===== PIN SENSOR =====
// Sesuaikan dengan hardware Anda
#define PIN_WATER_LEVEL A0
#define PIN_BATTERY     A1

void setup() {
  Serial.begin(115200);

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi terhubung: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Baca sensor (ganti dengan logika sensor Anda)
    int waterLevel = analogRead(PIN_WATER_LEVEL);  // 0-4095
    int rainfall   = getRainfallValue();             // fungsi custom
    int battery    = getBatteryPercent();            // 0-100

    sendSensorData(waterLevel, rainfall, battery);
  } else {
    Serial.println("[WiFi] Koneksi terputus, mencoba ulang...");
    WiFi.reconnect();
  }

  delay(INTERVAL_MS);
}

void sendSensorData(int waterLevel, int rainfall, int battery) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  // Buat JSON payload
  StaticJsonDocument<200> doc;
  doc["device_id"]   = DEVICE_ID;
  doc["water_level"] = waterLevel;
  doc["rainfall"]    = rainfall;
  doc["battery"]     = battery;

  String payload;
  serializeJson(doc, payload);

  Serial.println("[HTTP] Mengirim data: " + payload);
  int httpCode = http.POST(payload);

  if (httpCode == 201) {
    Serial.println("[HTTP] Data berhasil dikirim (201)");
    String response = http.getString();
    Serial.println("[HTTP] Response: " + response);
  } else {
    Serial.printf("[HTTP] Gagal, kode: %d\n", httpCode);
    Serial.println("[HTTP] Response: " + http.getString());
  }

  http.end();
}

// Contoh fungsi baca curah hujan
int getRainfallValue() {
  // Implementasikan sesuai sensor Anda (misal: tipping bucket)
  return 0;
}

// Contoh fungsi baca baterai
int getBatteryPercent() {
  int raw = analogRead(PIN_BATTERY);
  // Konversi ADC ke persentase (sesuaikan dengan rangkaian voltage divider)
  float voltage = raw * (3.3 / 4095.0) * 2; // contoh voltage divider 1:1
  return constrain(map(voltage * 100, 300, 420, 0, 100), 0, 100);
}
