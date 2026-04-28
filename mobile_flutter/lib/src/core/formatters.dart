import 'package:intl/intl.dart';

final _dateTimeFormatter = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
final _timeFormatter = DateFormat('HH:mm', 'id_ID');

String formatDateTime(DateTime value) => _dateTimeFormatter.format(value.toLocal());

String formatTime(DateTime value) => _timeFormatter.format(value.toLocal());
