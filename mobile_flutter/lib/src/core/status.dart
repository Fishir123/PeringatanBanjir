import 'package:flutter/material.dart';

enum FloodStatus { safe, alert, danger }

extension FloodStatusX on FloodStatus {
  String get label {
    switch (this) {
      case FloodStatus.safe:
        return 'Aman';
      case FloodStatus.alert:
        return 'Siaga';
      case FloodStatus.danger:
        return 'Bahaya';
    }
  }

  IconData get icon {
    switch (this) {
      case FloodStatus.safe:
        return Icons.verified_rounded;
      case FloodStatus.alert:
        return Icons.warning_amber_rounded;
      case FloodStatus.danger:
        return Icons.crisis_alert_rounded;
    }
  }

  String get citizenMessage {
    switch (this) {
      case FloodStatus.safe:
        return 'Kondisi air saat ini normal. Tetap pantau informasi secara berkala.';
      case FloodStatus.alert:
        return 'Air mulai meningkat. Siapkan barang penting dan tetap waspada.';
      case FloodStatus.danger:
        return 'Potensi banjir tinggi. Segera ikuti arahan evakuasi petugas setempat.';
    }
  }

  List<String> get quickActions {
    switch (this) {
      case FloodStatus.safe:
        return const [
          'Simpan nomor darurat desa.',
          'Pastikan jalur evakuasi keluarga diketahui.',
          'Pantau pembaruan setiap beberapa menit.',
        ];
      case FloodStatus.alert:
        return const [
          'Pindahkan dokumen penting ke tempat aman.',
          'Isi daya ponsel dan siapkan perlengkapan darurat.',
          'Pantau tinggi air dan instruksi dari desa.',
        ];
      case FloodStatus.danger:
        return const [
          'Utamakan keselamatan keluarga, jangan panik.',
          'Evakuasi ke titik aman terdekat.',
          'Ikuti instruksi petugas dan hindari arus air.',
        ];
    }
  }

  Color get color {
    switch (this) {
      case FloodStatus.safe:
        return const Color(0xFF16A34A);
      case FloodStatus.alert:
        return const Color(0xFFF59E0B);
      case FloodStatus.danger:
        return const Color(0xFFDC2626);
    }
  }

  Color get softBackground => color.withValues(alpha: 0.12);
}

FloodStatus mapBackendWaterStatus(String? waterStatusRaw) {
  switch (waterStatusRaw) {
    case 'safe':
      return FloodStatus.safe;
    case 'warning':
      return FloodStatus.alert;
    case 'danger':
    case 'critical':
      return FloodStatus.danger;
    default:
      return FloodStatus.safe;
  }
}

FloodStatus deriveStatusByWaterLevel(double level) {
  if (level <= 3) {
    return FloodStatus.danger;
  }

  if (level <= 10) {
    return FloodStatus.alert;
  }

  return FloodStatus.safe;
}
