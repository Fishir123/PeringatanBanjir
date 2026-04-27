import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:peringatan_banjir_mobile/src/core/api_config.dart';
import 'package:peringatan_banjir_mobile/src/data/models.dart';

class FloodApiService {
  FloodApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<List<SensorReading>> fetchHistory() async {
    try {
      return await _fetchSensorList(ApiConfig.sensorHistoryUri());
    } catch (_) {
      // fallback kompatibilitas jika backend endpoint berubah
      return _fetchSensorList(ApiConfig.sensorLatestUri());
    }
  }

  Future<List<SensorReading>> fetchLatestByDevice() async {
    try {
      return await _fetchSensorList(ApiConfig.sensorLatestUri());
    } catch (_) {
      // fallback kompatibilitas jika backend endpoint berubah
      return _fetchSensorList(ApiConfig.sensorHistoryUri());
    }
  }

  Future<WeatherInfo?> fetchLatestWeather() async {
    try {
      final map = await _fetchObject(ApiConfig.weatherLatestUri());
      if (map == null) return null;
      return WeatherInfo.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  Future<TideInfo?> fetchLatestTide() async {
    try {
      final map = await _fetchObject(ApiConfig.tideLatestUri());
      if (map == null) return null;
      return TideInfo.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  Future<List<SensorReading>> _fetchSensorList(Uri uri) async {
    final decoded = await _getJson(uri);
    final listPayload = _extractListPayload(decoded);

    return listPayload
        .whereType<Map<String, dynamic>>()
        .map(SensorReading.fromJson)
        .toList();
  }

  Future<Map<String, dynamic>?> _fetchObject(Uri uri) async {
    final decoded = await _getJson(uri);

    if (decoded is Map<String, dynamic>) {
      final direct = decoded['data'];
      if (direct is Map<String, dynamic>) {
        return direct;
      }

      if (decoded.containsKey('message') && direct == null) {
        return null;
      }

      return decoded;
    }

    return null;
  }

  Future<dynamic> _getJson(Uri uri) async {
    final response = await _client
        .get(uri, headers: const {'Accept': 'application/json'})
        .timeout(const Duration(seconds: 15));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Gagal mengambil data (${response.statusCode})');
    }

    return jsonDecode(response.body);
  }

  List<dynamic> _extractListPayload(dynamic body) {
    if (body is List) {
      return body;
    }

    if (body is! Map<String, dynamic>) {
      return const [];
    }

    final candidates = [
      body['data'],
      body['rows'],
      body['items'],
      body['result'],
      body['results'],
      body['payload'],
    ];

    for (final candidate in candidates) {
      if (candidate is List) {
        return candidate;
      }
      if (candidate is Map<String, dynamic>) {
        final nestedCandidates = [
          candidate['data'],
          candidate['rows'],
          candidate['items'],
          candidate['result'],
          candidate['results'],
          candidate['payload'],
        ];

        for (final nested in nestedCandidates) {
          if (nested is List) {
            return nested;
          }
        }
      }
    }

    return const [];
  }

  void dispose() {
    _client.close();
  }
}
