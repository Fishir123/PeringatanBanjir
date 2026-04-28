import 'package:flutter_test/flutter_test.dart';
import 'package:peringatan_banjir_mobile/src/app.dart';

void main() {
  testWidgets('App tampil dan tidak crash saat startup', (tester) async {
    await tester.pumpWidget(const FloodMobileApp());
    await tester.pumpAndSettle();

    expect(find.text('Peringatan Banjir'), findsOneWidget);
  });
}
