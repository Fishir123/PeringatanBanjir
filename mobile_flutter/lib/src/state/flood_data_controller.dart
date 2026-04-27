import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:peringatan_banjir_mobile/src/core/status.dart';
import 'package:peringatan_banjir_mobile/src/data/flood_api_service.dart';
import 'package:peringatan_banjir_mobile/src/data/models.dart';

class FloodDataController extends ChangeNotifier {
  FloodDataController({required FloodApiService apiService})
      : _apiService = apiService;

  final FloodApiService _apiService;

  List<SensorReading> history = const [];
  List<SensorReading> latestByDevice = const [];

  bool isLoading = true;
  bool isRefreshing = false;
  String? errorMessage;
  DateTime? lastUpdated;

  Timer? _timer;

  Future<void> initialize() async {
    await refresh();
    _timer ??= Timer.periodic(const Duration(seconds: 5), (_) {
      refresh(silent: true);
    });
  }

  Future<void> refresh({bool silent = false}) async {
    if (!silent) {
      if (history.isEmpty && latestByDevice.isEmpty) {
        isLoading = true;
      } else {
        isRefreshing = true;
      }
      notifyListeners();
    }

    try {
      final results = await Future.wait([
        _apiService.fetchHistory(),
        _apiService.fetchLatestByDevice(),
      ]);

      history = results[0];
      latestByDevice = results[1];
      errorMessage = null;
      lastUpdated = DateTime.now();
    } catch (error) {
      errorMessage = error.toString().replaceFirst('Exception: ', '');
    } finally {
      isLoading = false;
      isRefreshing = false;
      notifyListeners();
    }
  }

  DashboardSummary get summary {
    final latest = latestByDevice.isNotEmpty ? latestByDevice.first : null;
    final average = history.isEmpty
        ? 0.0
        : history
                .map((item) => item.waterLevel)
                .reduce((a, b) => a + b) /
            history.length;

    final devices = deviceStatuses;
    final today = DateTime.now();
    final todayCount = history.where((item) {
      return item.status != FloodStatus.safe &&
          item.timestamp.year == today.year &&
          item.timestamp.month == today.month &&
          item.timestamp.day == today.day;
    }).length;

    return DashboardSummary(
      status: latest?.status ?? FloodStatus.safe,
      latestWaterLevel: latest?.waterLevel ?? 0,
      averageWaterLevel: average,
      devicesOnline: devices.where((device) => device.isOnline).length,
      devicesTotal: devices.length,
      todayNotifications: todayCount,
    );
  }

  List<DeviceStatus> get deviceStatuses {
    final now = DateTime.now();

    return latestByDevice.map((item) {
      final difference = now.difference(item.timestamp);
      final isOnline = difference.inMinutes < 2;
      return DeviceStatus(
        deviceId: item.deviceId,
        isOnline: isOnline,
        lastSeen: item.timestamp,
      );
    }).toList();
  }

  List<SensorReading> get chartReadings {
    final chronological = history.reversed.toList();
    if (chronological.length <= 24) {
      return chronological;
    }
    return chronological.sublist(chronological.length - 24);
  }

  List<FloodNotification> get notifications {
    final items = history
        .where((item) => item.status != FloodStatus.safe)
        .take(20)
        .toList();

    if (items.isEmpty) {
      return [
        FloodNotification(
          id: 'no-alert',
          type: FloodStatus.safe,
          title: 'Status Normal',
          message: 'Belum ada peringatan dari data sensor terbaru.',
          timestamp: DateTime.now(),
          isRead: true,
        ),
      ];
    }

    return items.asMap().entries.map((entry) {
      final index = entry.key;
      final row = entry.value;

      return FloodNotification(
        id: '${row.id}-$index',
        type: row.status,
        title: 'Status ${row.status.label}',
        message:
            'Perangkat ${row.deviceId} membaca tinggi air ${row.waterLevel.toStringAsFixed(1)} cm',
        timestamp: row.timestamp,
        isRead: index > 1,
      );
    }).toList();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _apiService.dispose();
    super.dispose();
  }
}
