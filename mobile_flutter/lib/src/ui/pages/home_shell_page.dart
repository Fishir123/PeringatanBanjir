import 'package:flutter/material.dart';
import 'package:peringatan_banjir_mobile/src/core/formatters.dart';
import 'package:peringatan_banjir_mobile/src/data/flood_api_service.dart';
import 'package:peringatan_banjir_mobile/src/state/flood_data_controller.dart';
import 'package:peringatan_banjir_mobile/src/ui/pages/dashboard_page.dart';
import 'package:peringatan_banjir_mobile/src/ui/pages/notifications_page.dart';
import 'package:peringatan_banjir_mobile/src/ui/widgets/error_state.dart';

class HomeShellPage extends StatefulWidget {
  const HomeShellPage({super.key});

  @override
  State<HomeShellPage> createState() => _HomeShellPageState();
}

class _HomeShellPageState extends State<HomeShellPage> {
  late final FloodDataController _controller;
  int _currentIndex = 0;

  static const _titles = ['Status Banjir', 'Notifikasi'];

  @override
  void initState() {
    super.initState();
    _controller = FloodDataController(apiService: FloodApiService())..initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _refresh() => _controller.refresh();

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final hasAnyData = _controller.history.isNotEmpty ||
            _controller.latestByDevice.isNotEmpty;

        if (_controller.isLoading && !hasAnyData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (_controller.errorMessage != null && !hasAnyData) {
          return Scaffold(
            appBar: AppBar(title: const Text('Peringatan Banjir')),
            body: ErrorState(
              message: _controller.errorMessage!,
              onRetry: _refresh,
            ),
          );
        }

        final pages = [
          DashboardPage(controller: _controller, onRefresh: _refresh),
          NotificationsPage(controller: _controller, onRefresh: _refresh),
        ];

        return Scaffold(
          appBar: AppBar(
            title: Text(_titles[_currentIndex]),
            actions: [
              if (_controller.lastUpdated != null)
                Padding(
                  padding: const EdgeInsets.only(right: 4),
                  child: Center(
                    child: Text(
                      formatTime(_controller.lastUpdated!),
                      style: Theme.of(context).textTheme.labelMedium,
                    ),
                  ),
                ),
              IconButton(
                onPressed: _controller.isRefreshing ? null : _refresh,
                icon: _controller.isRefreshing
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh),
              ),
            ],
          ),
          body: Column(
            children: [
              if (_controller.errorMessage != null)
                Container(
                  width: double.infinity,
                  color: const Color(0xFFFEF2F2),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Text(
                    _controller.errorMessage!,
                    style: const TextStyle(
                      color: Color(0xFFB91C1C),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: pages[_currentIndex],
                ),
              ),
            ],
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) {
              setState(() => _currentIndex = index);
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded),
                label: 'Status',
              ),
              NavigationDestination(
                icon: Icon(Icons.notifications_outlined),
                selectedIcon: Icon(Icons.notifications),
                label: 'Info',
              ),
            ],
          ),
        );
      },
    );
  }
}
