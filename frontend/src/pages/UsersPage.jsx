import { useState } from 'react';
import { users } from '@/data/dummy-data';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
const UsersPage = () => {
    const [list, setList] = useState(users);
    const [modal, setModal] = useState({ open: false });
    const [form, setForm] = useState({ name: '', email: '', role: 'Operator' });
    const openAdd = () => { setForm({ name: '', email: '', role: 'Operator' }); setModal({ open: true }); };
    const openEdit = (u) => { setForm({ name: u.name, email: u.email, role: u.role }); setModal({ open: true, user: u }); };
    const handleSave = () => {
        if (!form.name || !form.email)
            return;
        if (modal.user) {
            setList(list.map(u => u.id === modal.user.id ? { ...u, ...form } : u));
        }
        else {
            setList([...list, { id: `USR-${String(list.length + 1).padStart(3, '0')}`, ...form, status: 'active', lastLogin: new Date().toISOString() }]);
        }
        setModal({ open: false });
    };
    const handleDelete = (u) => {
        Swal.fire({
            title: 'Hapus User?', text: `Hapus ${u.name}?`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: 'hsl(0, 72%, 51%)', confirmButtonText: 'Hapus', cancelButtonText: 'Batal',
            background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)',
        }).then(r => { if (r.isConfirmed)
            setList(list.filter(x => x.id !== u.id)); });
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">👥 Manajemen User</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4"/> Tambah User
        </button>
      </div>

      <div className="flood-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-muted-foreground font-medium">Nama</th>
              <th className="pb-3 text-muted-foreground font-medium">Email</th>
              <th className="pb-3 text-muted-foreground font-medium">Role</th>
              <th className="pb-3 text-muted-foreground font-medium">Status</th>
              <th className="pb-3 text-muted-foreground font-medium">Login Terakhir</th>
              <th className="pb-3 text-muted-foreground font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => (<tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 text-card-foreground font-medium">{u.name}</td>
                <td className="py-2.5 text-muted-foreground">{u.email}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${u.role === 'Super Admin' ? 'status-badge-warning' : 'status-badge-safe'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${u.status === 'active' ? 'status-badge-safe' : 'status-badge-danger'}`}>
                    {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground text-xs">{new Date(u.lastLogin).toLocaleString('id-ID')}</td>
                <td className="py-2.5">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(u)} className="p-1.5 rounded hover:bg-muted text-status-danger"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      {modal.open && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">{modal.user ? 'Edit' : 'Tambah'} User</h3>
              <button onClick={() => setModal({ open: false })} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
                <option value="Super Admin">Super Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm rounded-lg bg-muted text-muted-foreground hover:bg-accent">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default UsersPage;
