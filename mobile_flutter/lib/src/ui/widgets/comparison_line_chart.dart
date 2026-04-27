import 'package:flutter/material.dart';

class ComparisonLineChart extends StatelessWidget {
  const ComparisonLineChart({
    super.key,
    required this.actual,
    required this.predicted,
    this.height = 210,
  });

  final List<double> actual;
  final List<double> predicted;
  final double height;

  @override
  Widget build(BuildContext context) {
    final count = actual.length < predicted.length ? actual.length : predicted.length;

    if (count < 2) {
      return SizedBox(
        height: height,
        child: const Center(child: Text('Data prediksi belum cukup')),
      );
    }

    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(
        painter: _ComparisonPainter(
          actual: actual.take(count).toList(),
          predicted: predicted.take(count).toList(),
        ),
      ),
    );
  }
}

class _ComparisonPainter extends CustomPainter {
  _ComparisonPainter({required this.actual, required this.predicted});

  final List<double> actual;
  final List<double> predicted;

  @override
  void paint(Canvas canvas, Size size) {
    final all = [...actual, ...predicted];
    final minValue = all.reduce((a, b) => a < b ? a : b);
    final maxValue = all.reduce((a, b) => a > b ? a : b);
    final range = (maxValue - minValue).abs() < 0.01 ? 1.0 : (maxValue - minValue);

    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1;

    for (var i = 0; i < 4; i++) {
      final y = size.height * (i / 3);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    Path drawPath(List<double> values) {
      final path = Path();
      for (var i = 0; i < values.length; i++) {
        final x = i / (values.length - 1) * size.width;
        final normalized = (values[i] - minValue) / range;
        final y = size.height - (normalized * (size.height - 8)) - 4;

        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      return path;
    }

    final actualPath = drawPath(actual);
    final predictedPath = drawPath(predicted);

    canvas.drawPath(
      actualPath,
      Paint()
        ..color = const Color(0xFFF59E0B)
        ..strokeWidth = 2.3
        ..style = PaintingStyle.stroke,
    );

    canvas.drawPath(
      predictedPath,
      Paint()
        ..color = const Color(0xFF0EA5E9)
        ..strokeWidth = 2.3
        ..style = PaintingStyle.stroke,
    );
  }

  @override
  bool shouldRepaint(covariant _ComparisonPainter oldDelegate) {
    return oldDelegate.actual != actual || oldDelegate.predicted != predicted;
  }
}
