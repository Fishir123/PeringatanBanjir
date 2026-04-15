import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Download } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLatestSensorByDeviceQuery, useSensorHistoryQuery } from '@/features/sensor/hooks/useSensorQueries';
import { buildDeviceRows, mapSensorRowToUi } from '@/features/sensor/utils/sensorMappers';
import { statusLabels } from '@/shared/constants/status';
// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
const badgeClass = {
    safe: 'status-badge-safe',
    alert: 'status-badge-alert',
    warning: 'status-badge-warning',
    danger: 'status-badge-danger',
};
const PAGE_SIZE = 10;
const LeafletMap = ({ devices }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    useEffect(() => {
        if (!mapRef.current || mapInstance.current)
            return;
        const map = L.map(mapRef.current).setView([-6.86, 107.63], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
        devices.forEach(d => {
            L.marker([d.lat, d.lng]).addTo(map).bindPopup(`<strong>${d.name}</strong><br/>${d.location}<br/>Status: ${d.status}`);
        });
        mapInstance.current = map;
        return () => { map.remove(); mapInstance.current = null; };
    }, []);
    return <div ref={mapRef} style={{ height: '100%', width: '100%' }}/>;
};
const SensorPage = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
  const historyQuery = useSensorHistoryQuery();
  const latestQuery = useLatestSensorByDeviceQuery();
  const sensorRows = useMemo(() => (historyQuery.data ?? []).map(mapSensorRowToUi), [historyQuery.data]);
  const devices = useMemo(() => buildDeviceRows(latestQuery.data), [latestQuery.data]);
    const filtered = useMemo(() => {
        if (!search)
      return sensorRows;
        const q = search.toLowerCase();
    return sensorRows.filter(s => String(s.id).toLowerCase().includes(q) || s.deviceId.toLowerCase().includes(q) || statusLabels[s.status].toLowerCase().includes(q));
  }, [search, sensorRows]);
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const exportCSV = () => {
    const header = 'Timestamp,Device ID,Tinggi Air,Status\n';
    const rows = filtered.map(s => `${s.timestamp},${s.deviceId},${s.waterLevel},${statusLabels[s.status]}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sensor-data.csv';
        a.click();
    };
  if (historyQuery.isLoading || latestQuery.isLoading) {
    return (<div className="flood-card">
    <p className="text-sm text-muted-foreground">Memuat data sensor dari backend...</p>
    </div>);
  }
  if (historyQuery.isError || latestQuery.isError) {
    return (<div className="flood-card border border-status-danger/40">
    <p className="text-sm text-status-danger">Gagal memuat data sensor. Pastikan backend berjalan di port 3000.</p>
    </div>);
  }
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-card-foreground">📡 Monitoring Data Sensor</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Cari sensor..." className="pl-9 pr-3 py-2 text-sm rounded-lg bg-card border border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none w-56"/>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4"/> Export CSV
          </button>
        </div>
      </div>

      {/* Status perangkat */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {devices.map(d => (<div key={d.id} className="flood-card text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${d.status === 'online' ? 'bg-status-safe animate-pulse-glow' : 'bg-muted-foreground'}`}/>
            <p className="text-xs font-semibold text-card-foreground truncate">{d.name}</p>
            <p className="text-[10px] text-muted-foreground">{d.status === 'online' ? 'Online' : 'Offline'}</p>
          </div>))}
      </div>

      {/* Table */}
      <div className="flood-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-muted-foreground font-medium">Timestamp</th>
              <th className="pb-3 text-muted-foreground font-medium">Tinggi Air</th>
              <th className="pb-3 text-muted-foreground font-medium">Curah Hujan</th>
              <th className="pb-3 text-muted-foreground font-medium">Kec. Naik</th>
              <th className="pb-3 text-muted-foreground font-medium">Durasi Hujan</th>
              <th className="pb-3 text-muted-foreground font-medium">Perangkat</th>
              <th className="pb-3 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(s => (<tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 text-card-foreground font-mono text-xs">{new Date(s.timestamp).toLocaleString('id-ID')}</td>
                <td className="py-2.5 text-card-foreground">{s.waterLevel} cm</td>
                <td className="py-2.5 text-card-foreground">-</td>
                <td className="py-2.5 text-card-foreground">-</td>
                <td className="py-2.5 text-card-foreground">-</td>
                <td className="py-2.5 text-card-foreground font-mono text-xs">{s.deviceId}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </td>
              </tr>))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Menampilkan {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari {filtered.length}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-accent disabled:opacity-50">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-accent disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flood-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">🗺️ Peta Lokasi Sensor</h3>
        <div className="h-[350px] rounded-lg overflow-hidden">
          <LeafletMap devices={devices}/>
        </div>
      </div>
    </div>);
};
export default SensorPage;
