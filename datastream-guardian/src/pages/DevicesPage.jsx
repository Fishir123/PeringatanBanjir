import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useLatestSensorByDeviceQuery } from '@/features/sensor/hooks/useSensorQueries';
import { buildDeviceRows } from '@/features/sensor/utils/sensorMappers';
const DevicesPage = () => {
  const latestQuery = useLatestSensorByDeviceQuery();
  const [list, setList] = useState(() => buildDeviceRows(latestQuery.data));
    const [modal, setModal] = useState({ open: false });
    const [form, setForm] = useState({ name: '', location: '', lat: '', lng: '' });
    const openAdd = () => {
        setForm({ name: '', location: '', lat: '', lng: '' });
        setModal({ open: true });
    };
    const openEdit = (d) => {
        setForm({ name: d.name, location: d.location, lat: String(d.lat), lng: String(d.lng) });
        setModal({ open: true, device: d });
    };
    const handleSave = () => {
        if (!form.name)
            return;
        if (modal.device) {
            setList(list.map(d => d.id === modal.device.id ? { ...d, name: form.name, location: form.location, lat: Number(form.lat), lng: Number(form.lng) } : d));
        }
        else {
            const newDev = {
                id: `DEV-${String(list.length + 1).padStart(3, '0')}`,
                name: form.name,
                location: form.location,
                lat: Number(form.lat) || -6.86,
                lng: Number(form.lng) || 107.63,
                status: 'online',
                lastSeen: new Date().toISOString(),
                battery: 100,
            };
            setList([...list, newDev]);
        }
        setModal({ open: false });
    };
    const handleDelete = (d) => {
        Swal.fire({
            title: 'Hapus Perangkat?',
            text: `Hapus ${d.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(0, 72%, 51%)',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
            background: 'hsl(222, 25%, 12%)',
            color: 'hsl(210, 20%, 92%)',
        }).then(r => {
            if (r.isConfirmed)
                setList(list.filter(x => x.id !== d.id));
        });
    };
    useEffect(() => {
      if (!latestQuery.data || list.length > 0) {
        return;
      }
      setList(buildDeviceRows(latestQuery.data));
    }, [latestQuery.data, list.length]);
    if (latestQuery.isLoading && list.length === 0) {
        return (<div className="flood-card">
        <p className="text-sm text-muted-foreground">Memuat daftar perangkat dari backend...</p>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">📟 Manajemen Perangkat</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4"/> Tambah
        </button>
      </div>

      <div className="flood-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-muted-foreground font-medium">ID</th>
              <th className="pb-3 text-muted-foreground font-medium">Nama</th>
              <th className="pb-3 text-muted-foreground font-medium">Lokasi</th>
              <th className="pb-3 text-muted-foreground font-medium">Status</th>
              <th className="pb-3 text-muted-foreground font-medium">Baterai</th>
              <th className="pb-3 text-muted-foreground font-medium">Terakhir</th>
              <th className="pb-3 text-muted-foreground font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map(d => (<tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 font-mono text-xs text-card-foreground">{d.id}</td>
                <td className="py-2.5 text-card-foreground font-medium">{d.name}</td>
                <td className="py-2.5 text-muted-foreground">{d.location}</td>
                <td className="py-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${d.status === 'online' ? 'status-badge-safe' : 'status-badge-danger'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'online' ? 'bg-status-safe' : 'bg-status-danger'}`}/>
                    {d.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="py-2.5 text-card-foreground">{d.battery}%</td>
                <td className="py-2.5 text-muted-foreground text-xs">{new Date(d.lastSeen).toLocaleString('id-ID')}</td>
                <td className="py-2.5">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(d)} className="p-1.5 rounded hover:bg-muted text-status-danger"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal.open && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">{modal.device ? 'Edit' : 'Tambah'} Perangkat</h3>
              <button onClick={() => setModal({ open: false })} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama perangkat" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Lokasi" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} placeholder="Latitude" className="px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
                <input value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} placeholder="Longitude" className="px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm rounded-lg bg-muted text-muted-foreground hover:bg-accent">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default DevicesPage;
