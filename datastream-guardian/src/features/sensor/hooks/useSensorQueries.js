import { useQuery } from '@tanstack/react-query';
import { fetchLatestSensorByDevice, fetchSensorHistory } from '@/features/sensor/api/sensorApi';

const REFRESH_INTERVAL_MS = 5000;

export function useSensorHistoryQuery() {
  return useQuery({
    queryKey: ['sensor-history'],
    queryFn: fetchSensorHistory,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useLatestSensorByDeviceQuery() {
  return useQuery({
    queryKey: ['sensor-latest-by-device'],
    queryFn: fetchLatestSensorByDevice,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
