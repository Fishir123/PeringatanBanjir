import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw, Loader2, ShieldCheck, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAuthToken } from '@/features/auth/authStorage';

const API = '/api/users';

async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const res = await fetch(`${API}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.message || `Error ${res.status}`);
  return payload?.data ?? payload;
}

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  operator: 'Operator',
};

const EMPTY_FORM = { username: '', password: '', fullName: '', email: '', phone: '', role: 'admin' };

const UsersPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false });
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/');
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true });
  };

  const openEdit = (u) => {
    setForm({
      username: u.username,
      password: '',               // kosong → tidak diubah
      fullName: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role,
    });
    setModal({ open: true, user: u });
  };

  const handleSave = async () => {
    if (!form.username) return;
    if (!modal.user && !form.password) {
      Swal.fire({ title: 'Password wajib diisi', icon: 'warning', background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)' });
      return;
    }

    setSaving(true);
    try {
      if (modal.user) {
        // Edit: kirim semua field (password opsional)
        const body = { fullName: form.fullName, email: form.email, phone: form.phone, role: form.role };
        if (form.password) body.password = form.password;
        await apiFetch(`/${modal.user.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        // Tambah baru
        await apiFetch('/', { method: 'POST', body: JSON.stringify(form) });
      }
      setModal({ open: false });
      await fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'Gagal menyimpan', text: err.message, icon: 'error', background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u) => {
    const action = u.is_active ? 'Nonaktifkan' : 'Aktifkan';
    const result = await Swal.fire({
      title: `${action} user?`,
      text: `${action} akun ${u.username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: action,
      cancelButtonText: 'Batal',
      background: 'hsl(222, 25%, 12%)',
      color: 'hsl(210, 20%, 92%)',
    });
    if (!result.isConfirmed) return;
    try {
      await apiFetch(`/${u.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !u.is_active }) });
      await fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)' });
    }
  };

  const handleDelete = async (u) => {
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: `Akun "${u.username}" akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(0, 72%, 51%)',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      background: 'hsl(222, 25%, 12%)',
      color: 'hsl(210, 20%, 92%)',
    });
    if (!result.isConfirmed) return;
    try {
      await apiFetch(`/${u.id}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (err) {
      Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">👥 Manajemen User</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-accent"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Tambah User
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="flood-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-status-danger">
            <p className="font-semibold">Gagal memuat data</p>
            <p className="text-sm mt-1 text-muted-foreground">{error}</p>
            <button onClick={fetchUsers} className="mt-3 px-4 py-1.5 text-sm bg-muted rounded-lg hover:bg-accent">
              Coba Lagi
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">Username</th>
                <th className="pb-3 text-muted-foreground font-medium">Nama Lengkap</th>
                <th className="pb-3 text-muted-foreground font-medium">Email</th>
                <th className="pb-3 text-muted-foreground font-medium">Role</th>
                <th className="pb-3 text-muted-foreground font-medium">Status</th>
                <th className="pb-3 text-muted-foreground font-medium">Login Terakhir</th>
                <th className="pb-3 text-muted-foreground font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">Belum ada user</td>
                </tr>
              ) : list.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 text-card-foreground font-medium flex items-center gap-2">
                    {u.role === 'super_admin'
                      ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                    {u.username}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{u.full_name || '—'}</td>
                  <td className="py-2.5 text-muted-foreground">{u.email || '—'}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${u.role === 'super_admin' ? 'status-badge-warning' : 'status-badge-safe'}`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${u.is_active ? 'status-badge-safe' : 'status-badge-danger'}`}
                      title="Klik untuk toggle aktif/nonaktif"
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="py-2.5 text-muted-foreground text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : '—'}
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded hover:bg-muted text-status-danger" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                {modal.user ? 'Edit' : 'Tambah'} User
              </h3>
              <button onClick={() => setModal({ open: false })} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Username {!modal.user && <span className="text-status-danger">*</span>}</label>
                <input
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Username"
                  disabled={!!modal.user}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Password {!modal.user && <span className="text-status-danger">*</span>}
                  {modal.user && <span className="opacity-60"> (kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={modal.user ? '••••••••' : 'Password baru'}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nama Lengkap</label>
                <input
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nama lengkap"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Telepon</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModal({ open: false })}
                className="px-4 py-2 text-sm rounded-lg bg-muted text-muted-foreground hover:bg-accent"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
