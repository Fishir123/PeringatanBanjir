import { useState } from 'react';
import { Bell, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSensorHistoryQuery } from '@/features/sensor/hooks/useSensorQueries';
import { buildNotificationRows } from '@/features/sensor/utils/sensorMappers';
import { statusLabels } from '@/shared/constants/status';
const badgeClass = {
    safe: 'status-badge-safe',
    alert: 'status-badge-alert',
    warning: 'status-badge-warning',
    danger: 'status-badge-danger',
};
const NotificationsPage = () => {
  const historyQuery = useSensorHistoryQuery();
  const notifications = buildNotificationRows(historyQuery.data, 20);
    const [threshold, setThreshold] = useState(150);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [waEnabled, setWaEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const handleThresholdSave = () => {
        Swal.fire({
            title: 'Tersimpan!',
            text: `Threshold tinggi air diatur ke ${threshold} cm`,
            icon: 'success',
            background: 'hsl(222, 25%, 12%)',
            color: 'hsl(210, 20%, 92%)',
            confirmButtonColor: 'hsl(142, 72%, 29%)',
        });
    };
    const Toggle = ({ enabled, onToggle, label }) => (<div className="flex items-center justify-between py-3 border-b border-border/50">
      <span className="text-sm text-card-foreground">{label}</span>
      <button onClick={onToggle} className="text-primary">
        {enabled ? <ToggleRight className="w-8 h-8"/> : <ToggleLeft className="w-8 h-8 text-muted-foreground"/>}
      </button>
    </div>);
    return (<div className="space-y-6">
      <h2 className="text-xl font-bold text-card-foreground">🔔 Manajemen Notifikasi</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div className="flood-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Pengaturan Threshold</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Batas Tinggi Air (cm)</label>
                <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              </div>
              <input type="range" min={50} max={250} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full accent-primary"/>
              <p className="text-xs text-muted-foreground">Notifikasi akan dikirim saat tinggi air melebihi {threshold} cm</p>
              <button onClick={handleThresholdSave} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">Simpan</button>
            </div>
          </div>

          <div className="flood-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2"><Bell className="w-4 h-4"/> Kanal Notifikasi</h3>
            <Toggle enabled={smsEnabled} onToggle={() => setSmsEnabled(!smsEnabled)} label="SMS"/>
            <Toggle enabled={waEnabled} onToggle={() => setWaEnabled(!waEnabled)} label="WhatsApp"/>
            <Toggle enabled={emailEnabled} onToggle={() => setEmailEnabled(!emailEnabled)} label="Email"/>
          </div>

          <div className="flood-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">📝 Template Pesan</h3>
            <textarea rows={4} defaultValue="⚠️ PERINGATAN BANJIR - Desa {nama_desa}. Tinggi air: {tinggi_air}cm. Status: {status}. Harap waspada dan ikuti instruksi evakuasi." className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"/>
          </div>
        </div>

        {/* History */}
        <div className="flood-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">📜 Riwayat Notifikasi</h3>
          <div className="space-y-3">
            {notifications.map(n => (<div key={n.id} className={`p-3 rounded-lg border ${!n.read ? 'bg-muted/50 border-primary/30' : 'border-border/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass[n.type]}`}>{statusLabels[n.type]}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleString('id-ID')}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"/>}
                </div>
                <p className="text-sm font-medium text-card-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
};
export default NotificationsPage;
