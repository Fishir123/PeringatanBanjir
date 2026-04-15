import { useMemo } from 'react';
import { Droplets, CloudRain, Cpu, Bell, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLatestSensorByDeviceQuery, useSensorHistoryQuery } from '@/features/sensor/hooks/useSensorQueries';
import {
  buildDashboardStatus,
  buildNotificationRows,
  buildRainfallChartData,
  buildWaterLevelChartData,
} from '@/features/sensor/utils/sensorMappers';
import { statusLabels } from '@/shared/constants/status';
const statusColorMap = {
    safe: 'status-badge-safe',
    alert: 'status-badge-alert',
    danger: 'status-badge-danger',
};
const statusBgMap = {
    safe: 'bg-status-safe',
    alert: 'bg-status-alert',
    danger: 'bg-status-danger',
};
const Dashboard = () => {
    const historyQuery = useSensorHistoryQuery();
    const latestQuery = useLatestSensorByDeviceQuery();
    const data = useMemo(() => buildDashboardStatus(latestQuery.data, historyQuery.data), [latestQuery.data, historyQuery.data]);
    const waterLevelChartData = useMemo(() => buildWaterLevelChartData(historyQuery.data), [historyQuery.data]);
    const rainfallChartData = useMemo(() => buildRainfallChartData(historyQuery.data), [historyQuery.data]);
    const notifications = useMemo(() => buildNotificationRows(historyQuery.data), [historyQuery.data]);
    const stats = [
        { icon: Cpu, label: 'Total Perangkat', value: data.devicesTotal, sub: `${data.devicesOnline} online` },
        { icon: Activity, label: 'Perangkat Online', value: data.devicesOnline, sub: `dari ${data.devicesTotal}` },
        { icon: Bell, label: 'Notifikasi Hari Ini', value: data.todayNotifications, sub: 'peringatan' },
        { icon: TrendingUp, label: 'Rata-rata Tinggi Air', value: `${data.avgWaterLevel} cm`, sub: '24 jam terakhir' },
    ];
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
      {/* Status banner */}
      <div className={`rounded-xl p-6 ${statusBgMap[data.status]} text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <p className="text-sm font-medium opacity-90">Status Banjir Saat Ini</p>
          <h2 className="text-3xl font-bold mt-1">{statusLabels[data.status].toUpperCase()}</h2>
          <p className="text-sm opacity-80 mt-1">Diperbarui setiap 5 detik (backend realtime)</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <Droplets className="w-8 h-8 mx-auto mb-1 opacity-80"/>
            <p className="text-2xl font-bold">{data.waterLevel.toFixed(1)}</p>
            <p className="text-xs opacity-80">cm (Tinggi Air)</p>
          </div>
          <div className="text-center">
            <CloudRain className="w-8 h-8 mx-auto mb-1 opacity-80"/>
            <p className="text-2xl font-bold">{data.rainfall.toFixed(1)}</p>
            <p className="text-xs opacity-80">mm (Curah Hujan, belum tersedia)</p>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {['safe', 'alert', 'danger'].map(s => (<div key={s} className={`rounded-lg px-4 py-3 text-center font-semibold text-sm ${statusColorMap[s]} ${data.status === s ? 'ring-2 ring-offset-2 ring-offset-background' : 'opacity-50'}`} style={{ ['--tw-ring-color']: undefined }}>
            {statusLabels[s]}
          </div>))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub }) => (<div key={label} className="stat-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary"/>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold text-card-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          </div>))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="flood-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">📊 Tren Tinggi Air (24 Jam)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={waterLevelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' }}/>
              <Area type="monotone" dataKey="level" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flood-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">🌧️ Curah Hujan (24 Jam)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rainfallChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' }}/>
              <Bar dataKey="rainfall" fill="hsl(var(--status-alert))" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notifications */}
      <div className="flood-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">🔔 Notifikasi Aktif</h3>
        <div className="space-y-2">
          {notifications.slice(0, 4).map(n => (<div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border ${!n.read ? 'bg-muted/50' : ''}`}>
              <span className={`mt-0.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusColorMap[n.type]}`}>
                {statusLabels[n.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>))}
        </div>
      </div>
    </div>);
};
export default Dashboard;
