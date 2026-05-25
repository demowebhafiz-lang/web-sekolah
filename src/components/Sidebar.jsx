import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  ListChecks,
  School,
  ScrollText,
  Settings,
  Users,
  X
} from 'lucide-react';
import SchoolLogo from './SchoolLogo.jsx';
import { getStoredUser } from '../features/auth/authService.js';
import { canAccess, formatRole, ROUTE_ROLES } from '../features/auth/roles.js';
import { cn } from '../lib/utils.js';

const menu = [
  { label: 'Dashboard', to: '/dashboard', roles: ROUTE_ROLES.dashboard, icon: LayoutDashboard },
  { label: 'Siswa', to: '/siswa', roles: ROUTE_ROLES.siswa, icon: Users },
  { label: 'Kelas', to: '/kelas', roles: ROUTE_ROLES.kelas, icon: School },
  { label: 'Guru', to: '/guru', roles: ROUTE_ROLES.guru, icon: GraduationCap },
  { label: 'Mapel', to: '/mapel', roles: ROUTE_ROLES.mapel, icon: LibraryBig },
  { label: 'Input Nilai', to: '/nilai/input', roles: ROUTE_ROLES.inputNilai, icon: ClipboardList },
  { label: 'Rekap Nilai', to: '/nilai/rekap', roles: ROUTE_ROLES.rekapNilai, icon: BarChart3 },
  { label: 'Input Hafalan', to: '/hafalan/input', roles: ROUTE_ROLES.inputHafalan, icon: BookOpenCheck },
  { label: 'Riwayat Hafalan', to: '/hafalan/riwayat', roles: ROUTE_ROLES.riwayatHafalan, icon: ListChecks },
  { label: 'Rekap Hafalan', to: '/hafalan/rekap', roles: ROUTE_ROLES.rekapHafalan, icon: ScrollText },
  { label: 'Laporan', to: '/laporan', roles: ROUTE_ROLES.laporan, icon: FileText },
  { label: 'Pengaturan', to: '/pengaturan', roles: ROUTE_ROLES.pengaturan, icon: Settings }
];

export default function Sidebar({ isOpen = false, onClose }) {
  const user = getStoredUser();
  const visibleMenu = menu.filter((item) => canAccess(user?.role, item.roles));

  return (
    <>
      <div className={cn('fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden', isOpen ? 'block' : 'hidden')} onClick={onClose} />
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-200 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_18rem)]" />
        <div className="relative flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <SchoolLogo className="h-11 w-11 shadow-lg shadow-emerald-950/20" fallbackClassName="bg-emerald-500 text-slate-950" />
            <div>
              <strong className="block text-sm font-semibold tracking-wide">Nilai Hafalan</strong>
              <small className="text-xs capitalize text-slate-400">{formatRole(user?.role)}</small>
            </div>
          </div>
          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden" type="button" onClick={onClose} aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigasi utama">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition',
                    'hover:translate-x-1 hover:bg-white/10 hover:text-white',
                    isActive && 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-400 hover:text-slate-950'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      'grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white',
                      isActive && 'bg-slate-950/10 text-slate-950 group-hover:bg-slate-950/10 group-hover:text-slate-950'
                    )}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <p className="text-xs font-medium text-slate-400">Tahun aktif</p>
            <p className="mt-1 text-sm font-semibold text-white">2026/2027 · Ganjil</p>
          </div>
        </div>
      </aside>
    </>
  );
}
