import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import SchoolLogo from './SchoolLogo.jsx';
import { getStoredUser, logout } from '../features/auth/authService.js';
import { formatRole } from '../features/auth/roles.js';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-topbar sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden" type="button" onClick={onMenuClick} aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </button>
          <SchoolLogo className="hidden h-10 w-10 rounded-lg sm:grid" fallbackClassName="bg-emerald-50 text-emerald-700 ring-emerald-100" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sistem Nilai & Hafalan</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">Dashboard Madrasah</h1>
          </div>
        </div>
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" placeholder="Cari siswa, kelas, atau laporan" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 sm:inline-flex" type="button" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden text-right sm:block">
            <strong className="block text-sm font-semibold text-slate-950">{user?.nama || 'Pengguna'}</strong>
            <span className="text-xs capitalize text-slate-500">{formatRole(user?.role)}</span>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50" type="button" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
