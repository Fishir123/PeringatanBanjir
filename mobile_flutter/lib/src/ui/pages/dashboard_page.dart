import 'package:flutter/material.dart';
import 'package:peringatan_banjir_mobile/src/core/formatters.dart';
import 'package:peringatan_banjir_mobile/src/core/status.dart';
import 'package:peringatan_banjir_mobile/src/data/models.dart';
import 'package:peringatan_banjir_mobile/src/state/flood_data_controller.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/sparkline_chart.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/status_chip.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({
    super.key,
    required this.controller,
    required this.onRefresh,
  });

  final FloodDataController controller;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final summary = controller.summary;
    final latestStatus = summary.status;
    final latestNotifications = controller.notifications.take(3).toList();
    final chartValues = controller.chartReadings
        .map((reading) => reading.waterLevel)
        .toList();

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          _HeroStatusCard(
            status: latestStatus,
            waterLevel: summary.latestWaterLevel,
            lastUpdated: controller.lastUpdated,
          ),
          const SizedBox(height: 14),
          _SimpleInfoRow(
            items: [
              _InfoItem(
                icon: Icons.sensors,
                label: 'Perangkat Aktif',
                value: '${summary.devicesOnline}/${summary.devicesTotal}',
              ),
              _InfoItem(
                icon: Icons.notification_important_rounded,
                label: 'Peringatan Hari Ini',
                value: '${summary.todayNotifications}',
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SimpleInfoRow(
            items: [
              _InfoItem(
                icon: Icons.water_drop_rounded,
                label: 'Rata-rata Ketinggian',
                value: '${summary.averageWaterLevel.toStringAsFixed(1)} cm',
              ),
              _InfoItem(
                icon: Icons.access_time_rounded,
                label: 'Pembaruan Terakhir',
                value: controller.lastUpdated != null
                    ? formatTime(controller.lastUpdated!)
                    : '-',
              ),
            ],
          ),
          const SizedBox(height: 18),
          _SectionTitle(
            title: 'Cuaca & Pasang Surut Laut',
            subtitle: 'Informasi pendukung kondisi banjir',
          ),
          const SizedBox(height: 8),
          _SimpleInfoRow(
            items: [
              _InfoItem(
                icon: Icons.cloud_rounded,
                label: 'Cuaca',
                value: _weatherText(controller.weatherInfo),
              ),
              _InfoItem(
                icon: Icons.waves_rounded,
                label: 'Pasang Surut',
                value: _tideText(controller.tideInfo),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SimpleInfoRow(
            items: [
              _InfoItem(
                icon: Icons.thermostat_rounded,
                label: 'Suhu / Kelembapan',
                value: _tempHumidityText(controller.weatherInfo),
              ),
              _InfoItem(
                icon: Icons.schedule_rounded,
                label: 'Jadwal Pasut',
                value: _tideScheduleText(controller.tideInfo),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _SectionTitle(
            title: 'Tren Ketinggian Air',
            subtitle: 'Pemantauan data terbaru',
          ),
          const SizedBox(height: 8),
          _SimpleCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SparklineChart(
                  values: chartValues,
                  lineColor: Theme.of(context).colorScheme.primary,
                  height: 170,
                ),
                const SizedBox(height: 8),
                Text(
                  'Tarik layar ke bawah untuk memperbarui data.',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          _SectionTitle(
            title: 'Notifikasi Penting',
            subtitle: 'Informasi terbaru untuk warga',
          ),
          const SizedBox(height: 8),
          ...latestNotifications.map(
            (item) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: item.type.softBackground,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: item.type.color.withValues(alpha: 0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(item.type.icon, color: item.type.color),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                item.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            StatusChip(status: item.type, compact: true),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(item.message),
                        const SizedBox(height: 4),
                        Text(
                          formatDateTime(item.timestamp),
                          style: Theme.of(context).textTheme.labelMedium,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroStatusCard extends StatelessWidget {
  const _HeroStatusCard({
    required this.status,
    required this.waterLevel,
    required this.lastUpdated,
  });

  final FloodStatus status;
  final double waterLevel;
  final DateTime? lastUpdated;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            status.color,
            status.color.withValues(alpha: 0.84),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(status.icon, color: Colors.white),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Status Banjir Saat Ini',
                      style: TextStyle(color: Colors.white70),
                    ),
                    Text(
                      status.label.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            status.citizenMessage,
            style: const TextStyle(color: Colors.white, height: 1.35),
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.water_drop_rounded, color: Colors.white),
                const SizedBox(width: 8),
                Text(
                  '${waterLevel.toStringAsFixed(1)} cm',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const Spacer(),
                Text(
                  lastUpdated != null ? 'Update ${formatTime(lastUpdated!)}' : '-',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Apa yang harus dilakukan sekarang?',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          ...status.quickActions.map(
            (step) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Icon(Icons.check_circle, size: 16, color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      step,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        Text(subtitle, style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}

class _SimpleCard extends StatelessWidget {
  const _SimpleCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: child,
    );
  }
}

class _SimpleInfoRow extends StatelessWidget {
  const _SimpleInfoRow({required this.items});

  final List<_InfoItem> items;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: items
          .map(
            (item) => Expanded(
              child: Container(
                margin: EdgeInsets.only(
                  right: item == items.first ? 6 : 0,
                  left: item == items.last ? 6 : 0,
                ),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(item.icon, size: 18, color: const Color(0xFF0EA5E9)),
                    const SizedBox(height: 6),
                    Text(item.label, style: Theme.of(context).textTheme.labelMedium),
                    const SizedBox(height: 2),
                    Text(
                      item.value,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

String _weatherText(WeatherInfo? weather) {
  if (weather == null) return 'Belum ada data';

  final desc = weather.weatherDesc?.trim();
  final rain = weather.rainfallMm;

  if (desc != null && desc.isNotEmpty) {
    if (rain != null && rain > 0) {
      return '$desc • ${rain.toStringAsFixed(1)} mm';
    }
    return desc;
  }

  if (rain != null) {
    return '${rain.toStringAsFixed(1)} mm';
  }

  return 'Belum ada data';
}

String _tempHumidityText(WeatherInfo? weather) {
  if (weather == null) return '-';

  final temp = weather.temperature;
  final humidity = weather.humidity;

  if (temp == null && humidity == null) return '-';
  if (temp != null && humidity != null) {
    return '${temp.toStringAsFixed(1)}°C • ${humidity.toStringAsFixed(0)}%';
  }

  if (temp != null) return '${temp.toStringAsFixed(1)}°C';
  return '${humidity!.toStringAsFixed(0)}%';
}

String _tideText(TideInfo? tide) {
  if (tide == null) return 'Belum ada data';

  final status = tide.tideStatus?.trim();
  final level = tide.tideLevelCm;

  String statusLabel;
  switch (status) {
    case 'high':
      statusLabel = 'Pasang Tinggi';
      break;
    case 'low':
      statusLabel = 'Surut';
      break;
    case 'rising':
      statusLabel = 'Air Naik';
      break;
    case 'falling':
      statusLabel = 'Air Turun';
      break;
    default:
      statusLabel = 'Tidak diketahui';
  }

  if (level != null) {
    return '$statusLabel • ${level.toStringAsFixed(1)} cm';
  }

  return statusLabel;
}

String _tideScheduleText(TideInfo? tide) {
  if (tide == null) return '-';

  final high = tide.highTideTime;
  final low = tide.lowTideTime;

  if ((high == null || high.isEmpty) && (low == null || low.isEmpty)) {
    return '-';
  }

  if (high != null && high.isNotEmpty && low != null && low.isNotEmpty) {
    return 'Pasang $high • Surut $low';
  }

  if (high != null && high.isNotEmpty) return 'Pasang $high';
  return 'Surut ${low!}';
}

class _InfoItem {
  const _InfoItem({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;
}
