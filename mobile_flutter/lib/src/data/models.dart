import 'package:peringatan_banjir_mobile/src/core/status.dart';

String? _pickFirstNonEmptyString(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value == null) continue;
    final text = value.toString().trim();
    if (text.isNotEmpty) return text;
  }
  return null;
}

DateTime? _pickDateTime(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value == null) continue;
    final parsed = DateTime.tryParse(value.toString());
    if (parsed != null) return parsed;
  }
  return null;
}

class SensorReading {
  const SensorReading({
    required this.id,
    required this.deviceId,
    required this.waterLevel,
    required this.status,
    required this.timestamp,
  });

  final String id;
  final String deviceId;
  final double waterLevel;
  final FloodStatus status;
  final DateTime timestamp;

  factory SensorReading.fromJson(Map<String, dynamic> json) {
    final waterLevel = _toDouble(
      json['water_level'] ?? json['waterLevel'] ?? json['level_cm'] ?? json['level'],
    );

    final backendStatus = _pickFirstNonEmptyString(json, const [
      'water_status',
      'waterStatus',
      'status',
      'risk_level',
      'riskLevel',
      'alert_level',
      'alertLevel',
    ]);

    final timestamp =
        _pickDateTime(json, const ['created_at', 'createdAt', 'recorded_at', 'recordedAt']) ??
            DateTime.now();

    return SensorReading(
      id: json['id']?.toString() ?? '-',
      deviceId: _pickFirstNonEmptyString(json, const ['device_id', 'deviceId', 'device']) ?? '-',
      waterLevel: waterLevel,
      status: backendStatus != null
          ? mapBackendWaterStatus(backendStatus)
          : deriveStatusByWaterLevel(waterLevel),
      timestamp: timestamp,
    );
  }

  static double _toDouble(dynamic value) {
    if (value is num) {
      return value.toDouble();
    }

    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class DeviceStatus {
  const DeviceStatus({
    required this.deviceId,
    required this.isOnline,
    required this.lastSeen,
  });

  final String deviceId;
  final bool isOnline;
  final DateTime lastSeen;
}

class FloodNotification {
  const FloodNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.isRead,
  });

  final String id;
  final FloodStatus type;
  final String title;
  final String message;
  final DateTime timestamp;
  final bool isRead;
}

class DashboardSummary {
  const DashboardSummary({
    required this.status,
    required this.latestWaterLevel,
    required this.averageWaterLevel,
    required this.devicesOnline,
    required this.devicesTotal,
    required this.todayNotifications,
  });

  final FloodStatus status;
  final double latestWaterLevel;
  final double averageWaterLevel;
  final int devicesOnline;
  final int devicesTotal;
  final int todayNotifications;
}

class WeatherInfo {
  const WeatherInfo({
    this.rainfallMm,
    this.humidity,
    this.temperature,
    this.weatherDesc,
    this.recordedAt,
    this.source,
  });

  final double? rainfallMm;
  final double? humidity;
  final double? temperature;
  final String? weatherDesc;
  final DateTime? recordedAt;
  final String? source;

  factory WeatherInfo.fromJson(Map<String, dynamic> json) {
    return WeatherInfo(
      rainfallMm: SensorReading._toDouble(json['rainfall_mm']),
      humidity: SensorReading._toDouble(json['humidity']),
      temperature: SensorReading._toDouble(json['temperature']),
      weatherDesc: _pickFirstNonEmptyString(json, const ['weather_desc', 'weatherDesc']),
      recordedAt: _pickDateTime(json, const ['recorded_at', 'recordedAt']),
      source: _pickFirstNonEmptyString(json, const ['source']),
    );
  }
}

class TideInfo {
  const TideInfo({
    this.tideLevelCm,
    this.tideStatus,
    this.highTideTime,
    this.lowTideTime,
    this.recordedAt,
    this.source,
  });

  final double? tideLevelCm;
  final String? tideStatus;
  final String? highTideTime;
  final String? lowTideTime;
  final DateTime? recordedAt;
  final String? source;

  factory TideInfo.fromJson(Map<String, dynamic> json) {
    return TideInfo(
      tideLevelCm: SensorReading._toDouble(json['tide_level_cm']),
      tideStatus: _pickFirstNonEmptyString(json, const ['tide_status', 'tideStatus']),
      highTideTime: _pickFirstNonEmptyString(json, const ['high_tide_time', 'highTideTime']),
      lowTideTime: _pickFirstNonEmptyString(json, const ['low_tide_time', 'lowTideTime']),
      recordedAt: _pickDateTime(json, const ['recorded_at', 'recordedAt']),
      source: _pickFirstNonEmptyString(json, const ['source']),
    );
  }
}
