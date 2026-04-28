import 'package:flutter/material.dart';
import 'package:peringatan_banjir_mobile/src/core/formatters.dart';
import 'package:peringatan_banjir_mobile/src/core/status.dart';
import 'package:peringatan_banjir_mobile/src/state/flood_data_controller.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/section_card.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/status_chip.dart';

class SensorPage extends StatefulWidget {
  const SensorPage({
    super.key,
    required this.controller,
    required this.onRefresh,
  });

  final FloodDataController controller;
  final Future<void> Function() onRefresh;

  @override
  State<SensorPage> createState() => _SensorPageState();
}

class _SensorPageState extends State<SensorPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final statuses = widget.controller.deviceStatuses;
    final filtered = query.isEmpty
        ? widget.controller.history
        : widget.controller.history.where((item) {
            return item.deviceId.toLowerCase().contains(query) ||
                item.status.label.toLowerCase().contains(query);
          }).toList();

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
        children: [
          TextField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
            textInputAction: TextInputAction.search,
            decoration: const InputDecoration(
              hintText: 'Cari device atau status...',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Status Perangkat',
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: statuses
                  .map(
                    (device) => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.circle,
                            size: 10,
                            color: device.isOnline
                                ? const Color(0xFF16A34A)
                                : const Color(0xFF94A3B8),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            device.deviceId,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            device.isOnline ? 'Online' : 'Offline',
                            style: Theme.of(context).textTheme.labelMedium,
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Data Sensor Terbaru',
            trailing: Text(
              '${filtered.length} data',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            child: Column(
              children: filtered.take(80).map((item) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.deviceId,
                              style:
                                  const TextStyle(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              formatDateTime(item.timestamp),
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${item.waterLevel.toStringAsFixed(1)} cm',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          StatusChip(status: item.status, compact: true),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
