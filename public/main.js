const API_BASE = '/api/sensor-data';
const tableBody = document.getElementById('sensorTableBody');
const statusText = document.getElementById('statusText');
const deviceIdInput = document.getElementById('deviceId');

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleString('id-ID', { hour12: false });
}

function getFloodStatus(level) {
  if (level >= 50) return { label: 'Bahaya', className: 'danger' };
  if (level >= 30) return { label: 'Waspada', className: 'warning' };
  return { label: 'Aman', className: 'safe' };
}

function getFloodStatusFromServer(waterStatus, level) {
  const map = {
    safe: { label: 'Aman', className: 'safe' },
    warning: { label: 'Waspada', className: 'warning' },
    danger: { label: 'Bahaya', className: 'danger' },
    critical: { label: 'Kritis', className: 'danger' }
  };

  if (waterStatus && map[waterStatus] && (Number.isNaN(level) || level < 50)) {
    return map[waterStatus];
  }

  return getFloodStatus(level);
}

function renderTable(data) {
  tableBody.innerHTML = '';

  if (!data.length) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty">Belum ada data</td></tr>';
    return;
  }

  data.forEach((item) => {
    const status = getFloodStatusFromServer(item.water_status, Number(item.water_level));
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.device_id}</td>
      <td>${Number(item.water_level).toFixed(2)}</td>
      <td>${formatDate(item.created_at)}</td>
      <td><span class="badge ${status.className}">${status.label}</span></td>
    `;

    tableBody.appendChild(row);
  });
}

async function fetchData(endpoint = '') {
  try {
    statusText.textContent = 'Memuat data...';
    const response = await fetch(`${API_BASE}${endpoint}?_=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    renderTable(result.data || []);
    statusText.textContent = `${result.data?.length || 0} data ditampilkan`;
  } catch (error) {
    statusText.textContent = `Gagal memuat data: ${error.message}`;
  }
}

document.getElementById('btnLatest').addEventListener('click', () => {
  fetchData('/latest');
});

document.getElementById('btnAll').addEventListener('click', () => {
  fetchData('');
});

document.getElementById('btnByDevice').addEventListener('click', () => {
  const deviceId = deviceIdInput.value.trim();
  if (!deviceId) {
    statusText.textContent = 'Isi device_id terlebih dahulu';
    return;
  }
  fetchData(`/${encodeURIComponent(deviceId)}`);
});

fetchData('');
setInterval(() => fetchData(''), 1000);
