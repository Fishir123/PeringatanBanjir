import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:peringatan_banjir_mobile/src/core/status.dart';
import 'package:peringatan_banjir_mobile/src/state/flood_data_controller.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/comparison_line_chart.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/section_card.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/status_chip.dart';

class PredictionPage extends StatelessWidget {
  const PredictionPage({
    super.key,
    required this.controller,
    required this.onRefresh,
  });

  final FloodDataController controller;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final source = controller.chartReadings;
    final actual = source.map((item) => item.waterLevel).toList();
    final predicted = <double>[];

    for (var i = 0; i < actual.length; i++) {
      final delta = math.sin(i / 3) * 2.5;
      predicted.add((actual[i] * 0.94) + delta);
    }

    final latestActual = actual.isEmpty ? 0.0 : actual.last;
    final latestPred = predicted.isEmpty ? 0.0 : predicted.last;
    final confidence = actual.isEmpty
        ? 0.0
        : (100 - (latestActual - latestPred).abs()).clamp(70, 99).toDouble();

    final latestStatus = source.isEmpty
        ? FloodStatus.safe
        : deriveStatusByWaterLevel(latestPred);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
        children: [
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  title: 'Prediksi',
                  value: '${latestPred.toStringAsFixed(1)} cm',
                  subtitle: 'estimasi 1 interval',
                  trailing: StatusChip(status: latestStatus, compact: true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _MetricTile(
                  title: 'Aktual',
                  value: '${latestActual.toStringAsFixed(1)} cm',
                  subtitle: 'data sensor terakhir',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _MetricTile(
            title: 'Confidence',
            value: '${confidence.toStringAsFixed(1)}%',
            subtitle: 'simulasi model ringan di mobile',
            progress: confidence / 100,
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Grafik Aktual vs Prediksi',
            child: ComparisonLineChart(actual: actual, predicted: predicted),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Confusion Matrix (Simulasi)',
            child: Table(
              border: TableBorder.all(color: const Color(0xFFE2E8F0)),
              children: const [
                TableRow(children: [
                  _Cell(text: '-'),
                  _Cell(text: 'Aman'),
                  _Cell(text: 'Siaga'),
                  _Cell(text: 'Bahaya'),
                ]),
                TableRow(children: [
                  _Cell(text: 'Aman'),
                  _Cell(text: '45'),
                  _Cell(text: '3'),
                  _Cell(text: '1'),
                ]),
                TableRow(children: [
                  _Cell(text: 'Siaga'),
                  _Cell(text: '2'),
                  _Cell(text: '38'),
                  _Cell(text: '4'),
                ]),
                TableRow(children: [
                  _Cell(text: 'Bahaya'),
                  _Cell(text: '0'),
                  _Cell(text: '2'),
                  _Cell(text: '29'),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.title,
    required this.value,
    required this.subtitle,
    this.progress,
    this.trailing,
  });

  final String title;
  final String value;
  final String subtitle;
  final double? progress;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(title, style: Theme.of(context).textTheme.bodySmall)),
              // ignore: use_null_aware_elements
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: Theme.of(context).textTheme.labelMedium),
          if (progress != null) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 8,
                backgroundColor: const Color(0xFFE2E8F0),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _Cell extends StatelessWidget {
  const _Cell({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
    );
  }
}
