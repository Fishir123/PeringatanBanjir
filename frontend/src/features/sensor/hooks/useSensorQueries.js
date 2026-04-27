import { useQuery } from '@tanstack/react-query';
import { fetchLatestSensorByDevice, fetchSensorHistory } from '@/features/sensor/api/sensorApi';
import { fetchLatestTide, fetchLatestWeather, fetchWeatherHistory } from '@/features/sensor/api/externalApi';

const REFRESH_INTERVAL_MS = 1000;

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

export function useLatestWeatherQuery() {
  return useQuery({
    queryKey: ['latest-weather'],
    queryFn: fetchLatestWeather,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useWeatherHistoryQuery() {
  return useQuery({
    queryKey: ['weather-history'],
    queryFn: () => fetchWeatherHistory(24),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useLatestTideQuery() {
  return useQuery({
    queryKey: ['latest-tide'],
    queryFn: fetchLatestTide,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
