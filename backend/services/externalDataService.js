const db = require('../config/db');

const CONFIG_DEFS = {
  weatherApiBaseUrl: {
    env: 'WEATHER_API_BASE_URL',
    dbKey: 'weather_api_base_url',
    type: 'string',
    description: 'Base URL API cuaca',
  },
  weatherApiKey: {
    env: 'WEATHER_API_KEY',
    dbKey: 'weather_api_key',
    type: 'string',
    description: 'API key layanan cuaca',
  },
  weatherLocationLat: {
    env: 'WEATHER_LOCATION_LAT',
    dbKey: 'weather_location_lat',
    type: 'number',
    description: 'Latitude lokasi cuaca',
  },
  weatherLocationLon: {
    env: 'WEATHER_LOCATION_LON',
    dbKey: 'weather_location_lon',
    type: 'number',
    description: 'Longitude lokasi cuaca',
  },
  tideApiBaseUrl: {
    env: 'TIDE_API_BASE_URL',
    dbKey: 'tide_api_base_url',
    type: 'string',
    description: 'Base URL API pasang surut',
  },
  tideApiKey: {
    env: 'TIDE_API_KEY',
    dbKey: 'tide_api_key',
    type: 'string',
    description: 'API key layanan pasang surut',
  },
  tideStationCode: {
    env: 'TIDE_STATION_CODE',
    dbKey: 'tide_station_code',
    type: 'string',
    description: 'Kode stasiun pasang surut',
  },
};

const KEY_CANDIDATES = ['appid', 'key', 'apikey', 'api_key', 'token', 'access_key'];

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function inferRainIntensity(rainfallMm) {
  if (!Number.isFinite(rainfallMm) || rainfallMm <= 0) return 'none';
  if (rainfallMm < 5) return 'light';
  if (rainfallMm < 20) return 'moderate';
  if (rainfallMm < 50) return 'heavy';
  return 'very_heavy';
}

function inferWindDirection(deg) {
  if (!Number.isFinite(deg)) return null;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

function normalizeToCm(value, unitHint = '') {
  const numericValue = toNumber(value);
  if (!Number.isFinite(numericValue)) return null;

  if (String(unitHint).toLowerCase() === 'm') {
    return Number((numericValue * 100).toFixed(2));
  }

  return Number(numericValue.toFixed(2));
}

function detectApiKeyParam(url) {
  const hostname = url.hostname.toLowerCase();

  if (hostname.includes('openweathermap')) return 'appid';
  if (hostname.includes('weatherapi')) return 'key';

  return 'apikey';
}

function attachApiKey(url, apiKey) {
  if (!apiKey) return;

  const alreadyHasKey = KEY_CANDIDATES.some((candidate) => url.searchParams.has(candidate));
  if (alreadyHasKey) return;

  url.searchParams.set(detectApiKeyParam(url), apiKey);
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

async function readIntegrationSettingsFromDb() {
  const dbKeys = Object.values(CONFIG_DEFS).map((item) => item.dbKey);

  const [rows] = await db.query(
    `SELECT \`key\`, \`value\`
     FROM system_settings
     WHERE \`key\` IN (${dbKeys.map(() => '?').join(', ')})`,
    dbKeys
  );

  const mapped = {};
  for (const row of rows) {
    const pair = Object.entries(CONFIG_DEFS).find(([, def]) => def.dbKey === row.key);
    if (!pair) continue;
    mapped[pair[0]] = row.value;
  }

  return mapped;
}

async function getIntegrationConfig() {
  const fallback = {};

  for (const [name, def] of Object.entries(CONFIG_DEFS)) {
    fallback[name] = process.env[def.env] || '';
  }

  try {
    const dbConfig = await readIntegrationSettingsFromDb();
    return {
      ...fallback,
      ...dbConfig,
    };
  } catch (error) {
    return fallback;
  }
}

async function saveIntegrationConfig(inputConfig = {}) {
  const updates = [];

  for (const [name, value] of Object.entries(inputConfig)) {
    if (!Object.prototype.hasOwnProperty.call(CONFIG_DEFS, name)) continue;

    const stringValue = String(value ?? '').trim();
    const definition = CONFIG_DEFS[name];

    updates.push({
      ...definition,
      value: stringValue,
    });

    process.env[definition.env] = stringValue;
  }

  if (updates.length === 0) {
    return getIntegrationConfig();
  }

  const upsertSql = `
    INSERT INTO system_settings (\`key\`, \`value\`, \`type\`, description, category, is_public)
    VALUES (?, ?, ?, ?, 'integration', FALSE)
    ON DUPLICATE KEY UPDATE
      \`value\` = VALUES(\`value\`),
      \`type\` = VALUES(\`type\`),
      description = VALUES(description),
      category = 'integration'
  `;

  try {
    for (const update of updates) {
      await db.query(upsertSql, [update.dbKey, update.value, update.type, update.description]);
    }
  } catch (error) {
    // If system_settings is unavailable, values still apply from process.env for current runtime.
  }

  return getIntegrationConfig();
}

function parseWeatherPayload(payload, config) {
  const now = new Date();

  const weatherCode =
    payload?.weather?.[0]?.id ??
    payload?.current?.condition?.code ??
    payload?.weather_code ??
    null;

  const weatherDesc =
    payload?.weather?.[0]?.description ??
    payload?.current?.condition?.text ??
    payload?.weather_desc ??
    null;

  const rainfallMm =
    toNumber(payload?.rain?.['1h']) ??
    toNumber(payload?.rain?.['3h']) ??
    toNumber(payload?.current?.precip_mm) ??
    toNumber(payload?.precip_mm) ??
    toNumber(payload?.rainfall_mm) ??
    0;

  const humidity =
    toNumber(payload?.main?.humidity) ??
    toNumber(payload?.current?.humidity) ??
    toNumber(payload?.humidity) ??
    null;

  const temperature =
    toNumber(payload?.main?.temp) ??
    toNumber(payload?.current?.temp_c) ??
    toNumber(payload?.temperature) ??
    null;

  const windSpeedKmhRaw =
    toNumber(payload?.wind?.speed) ??
    toNumber(payload?.current?.wind_kph) ??
    toNumber(payload?.wind_speed) ??
    null;

  const windSpeedKmh = windSpeedKmhRaw == null ? null : Number((windSpeedKmhRaw * 3.6).toFixed(2));
  const windDirection =
    payload?.wind?.deg != null
      ? inferWindDirection(toNumber(payload.wind.deg))
      : payload?.current?.wind_dir || payload?.wind_direction || null;

  return {
    rainfallMm: Number(rainfallMm.toFixed(2)),
    humidity,
    temperature,
    windSpeedKmh,
    windDirection,
    weatherCode: weatherCode == null ? null : String(weatherCode),
    weatherDesc,
    forecastDate: now.toISOString().slice(0, 10),
    forecastHour: now.getHours(),
    rainIntensity: inferRainIntensity(rainfallMm),
    source: payload?.source || 'EXTERNAL_API',
    locationCode: `${config.weatherLocationLat || ''},${config.weatherLocationLon || ''}`.replace(/^,|,$/g, '') || null,
  };
}

function parseTidePayload(payload, config) {
  const now = new Date();

  const heights = Array.isArray(payload?.heights) ? payload.heights : [];
  const latestHeight = heights.length > 0 ? heights[0] : null;
  const nextHeight = heights.length > 1 ? heights[1] : null;

  const events = Array.isArray(payload?.extremes) ? payload.extremes : [];
  const highEvent = events.find((item) => String(item?.type || '').toLowerCase().includes('high'));
  const lowEvent = events.find((item) => String(item?.type || '').toLowerCase().includes('low'));

  const unitHint = payload?.unit || payload?.units || '';

  const tideLevelCm = normalizeToCm(
    latestHeight?.height ?? payload?.tide_level ?? payload?.current?.height,
    unitHint
  );

  let tideStatus = String(payload?.tide_status || '').toLowerCase();
  if (!['high', 'low', 'rising', 'falling'].includes(tideStatus)) {
    if (nextHeight?.height != null && latestHeight?.height != null) {
      tideStatus = nextHeight.height > latestHeight.height ? 'rising' : 'falling';
    } else {
      tideStatus = 'rising';
    }
  }

  const highTideLevelCm = normalizeToCm(highEvent?.height, unitHint);
  const lowTideLevelCm = normalizeToCm(lowEvent?.height, unitHint);

  const highTideTime = highEvent?.date ? new Date(highEvent.date).toTimeString().slice(0, 8) : null;
  const lowTideTime = lowEvent?.date ? new Date(lowEvent.date).toTimeString().slice(0, 8) : null;

  return {
    tideLevelCm,
    tideStatus,
    highTideTime,
    highTideLevelCm,
    lowTideTime,
    lowTideLevelCm,
    predictionDate: now.toISOString().slice(0, 10),
    isSpringTide: false,
    isNeapTide: false,
    moonPhase: payload?.moon_phase || null,
    source: payload?.source || 'EXTERNAL_API',
    stationCode: config.tideStationCode || null,
  };
}

async function persistWeatherData(weatherData) {
  const sql = `
    INSERT INTO weather_data (
      rainfall_mm, humidity, temperature, wind_speed, wind_direction,
      weather_code, weather_desc, forecast_date, forecast_hour, rain_intensity,
      source, location_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.query(sql, [
    weatherData.rainfallMm,
    weatherData.humidity,
    weatherData.temperature,
    weatherData.windSpeedKmh,
    weatherData.windDirection,
    weatherData.weatherCode,
    weatherData.weatherDesc,
    weatherData.forecastDate,
    weatherData.forecastHour,
    weatherData.rainIntensity,
    weatherData.source,
    weatherData.locationCode,
  ]);
}

async function persistTideData(tideData) {
  const sql = `
    INSERT INTO tidal_data (
      tide_level_cm, tide_status, high_tide_time, high_tide_level_cm,
      low_tide_time, low_tide_level_cm, prediction_date, is_spring_tide,
      is_neap_tide, moon_phase, source, station_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.query(sql, [
    tideData.tideLevelCm,
    tideData.tideStatus,
    tideData.highTideTime,
    tideData.highTideLevelCm,
    tideData.lowTideTime,
    tideData.lowTideLevelCm,
    tideData.predictionDate,
    tideData.isSpringTide,
    tideData.isNeapTide,
    tideData.moonPhase,
    tideData.source,
    tideData.stationCode,
  ]);
}

async function fetchWeatherData(config) {
  if (!config.weatherApiBaseUrl) {
    throw new Error('WEATHER_API_BASE_URL belum diatur');
  }

  const url = new URL(config.weatherApiBaseUrl);

  if (config.weatherLocationLat && !url.searchParams.has('lat')) {
    url.searchParams.set('lat', config.weatherLocationLat);
  }

  if (config.weatherLocationLon && !url.searchParams.has('lon')) {
    url.searchParams.set('lon', config.weatherLocationLon);
  }

  attachApiKey(url, config.weatherApiKey);

  const timeout = withTimeout(10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: timeout.signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat cuaca (${response.status})`);
    }

    const payload = await response.json();
    const weatherData = parseWeatherPayload(payload, config);

    try {
      await persistWeatherData(weatherData);
    } catch (error) {
      // Keep API response even if persistence fails.
    }

    return {
      requestUrl: url.toString(),
      weatherData,
      raw: payload,
    };
  } finally {
    timeout.cleanup();
  }
}

async function fetchTideData(config) {
  if (!config.tideApiBaseUrl) {
    throw new Error('TIDE_API_BASE_URL belum diatur');
  }

  const url = new URL(config.tideApiBaseUrl);

  if (config.tideStationCode && !url.searchParams.has('station')) {
    url.searchParams.set('station', config.tideStationCode);
  }

  attachApiKey(url, config.tideApiKey);

  const timeout = withTimeout(10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: timeout.signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat pasang surut (${response.status})`);
    }

    const payload = await response.json();
    const tideData = parseTidePayload(payload, config);

    try {
      await persistTideData(tideData);
    } catch (error) {
      // Keep API response even if persistence fails.
    }

    return {
      requestUrl: url.toString(),
      tideData,
      raw: payload,
    };
  } finally {
    timeout.cleanup();
  }
}

function toPublicConfig(config) {
  return {
    weatherApiBaseUrl: config.weatherApiBaseUrl || '',
    weatherApiKey: config.weatherApiKey || '',
    weatherLocationLat: config.weatherLocationLat || '',
    weatherLocationLon: config.weatherLocationLon || '',
    tideApiBaseUrl: config.tideApiBaseUrl || '',
    tideApiKey: config.tideApiKey || '',
    tideStationCode: config.tideStationCode || '',
  };
}

module.exports = {
  getIntegrationConfig,
  saveIntegrationConfig,
  fetchWeatherData,
  fetchTideData,
  toPublicConfig,
};
