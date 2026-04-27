import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:peringatan_banjir_mobile/src/core/api_config.dart';
import 'package:peringatan_banjir_mobile/src/data/models.dart';

class FloodApiService {
  FloodApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<List<SensorReading>> fetchHistory() {
    return _fetchSensorList(ApiConfig.sensorHistoryUri());
  }

  Future<List<SensorReading>> fetchLatestByDevice() {
    return _fetchSensorList(ApiConfig.sensorLatestUri());
  }

  Future<List<SensorReading>> _fetchSensorList(Uri uri) async {
    final response = await _client
        .get(uri, headers: const {'Accept': 'application/json'})
        .timeout(const Duration(seconds: 15));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Gagal mengambil data (${response.statusCode})');
    }

    final body = jsonDecode(response.body);
    final data = body is Map<String, dynamic> ? body['data'] : null;

    if (data is! List) {
      return const [];
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(SensorReading.fromJson)
        .toList();
  }

  void dispose() {
    _client.close();
  }
}
