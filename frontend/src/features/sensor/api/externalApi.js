const API_PREFIX = import.meta.env.VITE_EXTERNAL_API_PREFIX || '/api/external';

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${API_PREFIX}${pathname}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Request gagal (${response.status})`);
  }

  return payload?.data;
}

export function fetchExternalConfig() {
  return requestJson('/config', { method: 'GET' });
}

export function updateExternalConfig(data) {
  return requestJson('/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function triggerWeatherFetch() {
  return requestJson('/weather/fetch', { method: 'POST' });
}

export function triggerTideFetch() {
  return requestJson('/tide/fetch', { method: 'POST' });
}

export function triggerCombinedFetch() {
  return requestJson('/fetch-all', { method: 'POST' });
}
