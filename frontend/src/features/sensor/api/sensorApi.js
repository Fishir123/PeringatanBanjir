const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/sensor-data';

async function requestJson(pathname = '') {
  const response = await fetch(`${API_PREFIX}${pathname}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat data sensor (${response.status})`);
  }

  const payload = await response.json();
  return payload?.data ?? [];
}

export async function fetchSensorHistory() {
  return requestJson('');
}

export async function fetchLatestSensorByDevice() {
  return requestJson('/latest');
}
