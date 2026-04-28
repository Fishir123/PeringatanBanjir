import { useState } from 'react';
import { Droplets, Lock, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err?.message || 'Login gagal');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Droplets className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">DataStream Guardian</h1>
            <p className="text-sm text-muted-foreground">Login untuk masuk ke dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-muted-foreground">
            Username
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-card-foreground focus:outline-none"
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="block text-sm text-muted-foreground">
            Password
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-card-foreground focus:outline-none"
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
