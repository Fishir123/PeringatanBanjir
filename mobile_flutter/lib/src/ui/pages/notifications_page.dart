import 'package:flutter/material.dart';
import 'package:peringatan_banjir_mobile/src/core/formatters.dart';
import 'package:peringatan_banjir_mobile/src/core/status.dart';
import 'package:peringatan_banjir_mobile/src/state/flood_data_controller.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/status_chip.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({
    super.key,
    required this.controller,
    required this.onRefresh,
  });

  final FloodDataController controller;
  final Future<void> Function() onRefresh;

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  bool _showUnreadOnly = false;

  @override
  Widget build(BuildContext context) {
    final notifications = _showUnreadOnly
        ? widget.controller.notifications.where((item) => !item.isRead).toList()
        : widget.controller.notifications;

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
        children: [
          Text(
            'Informasi & Peringatan',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Lihat informasi terbaru dari sistem peringatan banjir desa.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 10),
          FilterChip(
            selected: _showUnreadOnly,
            label: const Text('Tampilkan yang belum dibaca saja'),
            onSelected: (selected) {
              setState(() => _showUnreadOnly = selected);
            },
          ),
          const SizedBox(height: 12),
          ...notifications.map(
            (item) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: item.type.softBackground,
                border: Border.all(
                  color: item.type.color.withValues(alpha: 0.25),
                ),
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
                                style: const TextStyle(fontWeight: FontWeight.w800),
                              ),
                            ),
                            StatusChip(status: item.type, compact: true),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(item.message),
                        const SizedBox(height: 6),
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
