import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:peringatan_banjir_mobile/src/core/app_theme.dart';
import 'package:peringatan_banjir_mobile/src/ui/pages/home_shell_page.dart';

class FloodMobileApp extends StatelessWidget {
  const FloodMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Peringatan Banjir',
      theme: AppTheme.light(),
      locale: const Locale('id', 'ID'),
      supportedLocales: const [Locale('id', 'ID'), Locale('en', 'US')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const HomeShellPage(),
    );
  }
}
