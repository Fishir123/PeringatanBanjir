import 'package:peringatan_banjir_mobile/src/core/status.dart';

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
    final waterLevel = _toDouble(json['water_level']);
    final backendStatus = json['water_status']?.toString();

    return SensorReading(
      id: json['id']?.toString() ?? '-',
      deviceId: json['device_id']?.toString() ?? '-',
      waterLevel: waterLevel,
      status: backendStatus != null
          ? mapBackendWaterStatus(backendStatus)
          : deriveStatusByWaterLevel(waterLevel),
      timestamp: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
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
