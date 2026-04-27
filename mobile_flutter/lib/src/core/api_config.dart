import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String _configuredBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get baseUrl {
    final configured = _configuredBaseUrl.trim();
    final raw = configured.isNotEmpty ? configured : _platformDefaultBaseUrl();

    return raw.endsWith('/') ? raw.substring(0, raw.length - 1) : raw;
  }

  static String _platformDefaultBaseUrl() {
    if (kIsWeb) {
      return 'http://127.0.0.1:3000';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // Android emulator -> localhost host machine
        return 'http://10.0.2.2:3000';
      case TargetPlatform.iOS:
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.fuchsia:
        return 'http://127.0.0.1:3000';
    }
  }

  static Uri sensorHistoryUri() => Uri.parse('$baseUrl/api/sensor-data');

  static Uri sensorLatestUri() => Uri.parse('$baseUrl/api/sensor-data/latest');
}
