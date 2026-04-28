const API_PREFIX = import.meta.env.VITE_AUTH_API_PREFIX || '/api/auth';

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${API_PREFIX}${pathname}`, {
    cache: 'no-store',
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

export function loginUser({ username, password }) {
  return requestJson('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function registerUser(payload) {
  return requestJson('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
