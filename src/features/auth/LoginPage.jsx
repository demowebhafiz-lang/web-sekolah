import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck, ClipboardList, Eye, EyeOff, Loader2, School, Settings, Users } from 'lucide-react';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import { getStoredSettings } from '../settings/settingsService.js';
import { isAuthenticated, login } from './authService.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const settings = getStoredSettings();
  const schoolName = settings?.schoolName || 'Sistem Nilai & Hafalan';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Panel - Info */}
          <div className="hidden flex-col justify-center space-y-8 lg:flex">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <SchoolLogo className="h-16 w-16" fallbackClassName="bg-emerald-500 text-slate-950" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{schoolName}</h1>
                  <p className="text-sm text-slate-600">Sistem Nilai & Hafalan</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Akses Berdasarkan Role</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Gunakan akun admin, guru, wali kelas, atau kepala sekolah yang sudah dibuat oleh admin.
                </p>
              </div>

              <div className="space-y-4">
                <RoleInfo
                  icon={Settings}
                  title="Admin"
                  description="Kelola data master dan pengaturan sistem"
                />
                <RoleInfo
                  icon={ClipboardList}
                  title="Guru Mapel"
                  description="Input dan rekap nilai siswa"
                />
                <RoleInfo
                  icon={BookOpenCheck}
                  title="Guru Tahfidz"
                  description="Input dan rekap hafalan siswa"
                />
                <RoleInfo
                  icon={Users}
                  title="Wali Kelas"
                  description="Pantau siswa dan laporan kelas"
                />
                <RoleInfo
                  icon={School}
                  title="Kepala Sekolah"
                  description="Monitoring dan laporan sekolah"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200 lg:p-10">
              {/* Mobile Logo */}
              <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
                <SchoolLogo className="h-16 w-16" fallbackClassName="bg-emerald-500 text-slate-950" />
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900">{schoolName}</h1>
                  <p className="text-sm text-slate-600">Sistem Nilai & Hafalan</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Masuk ke Sistem</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Gunakan akun yang sudah dibuat oleh admin sekolah
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="nama@sekolah.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 px-4 pr-11 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Masukkan password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                <button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Lupa password? Hubungi admin sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function RoleInfo({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
