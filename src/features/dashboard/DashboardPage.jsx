import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AlertCircle, BookOpenCheck, GraduationCap, School, TrendingUp, Users, FileText } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getCurrentUser } from '../auth/authService.js';
import { ROLES } from '../auth/roles.js';
import { useState, useEffect } from 'react';

const stats = [
  { title: 'Siswa Aktif', value: '250', description: '12 kelas aktif', icon: Users, tone: 'emerald', trend: '+8' },
  { title: 'Rata-rata Nilai', value: '84.5', description: 'Semester ganjil', icon: TrendingUp, tone: 'amber', trend: '+2.1' },
  { title: 'Hafalan Lancar', value: '120', description: 'Setoran valid', icon: BookOpenCheck, tone: 'emerald' },
  { title: 'Perlu Perbaikan', value: '25', description: 'Butuh tindak lanjut', icon: AlertCircle, tone: 'rose' }
];

const nilaiData = [
  { bulan: 'Jul', nilai: 78 },
  { bulan: 'Agu', nilai: 81 },
  { bulan: 'Sep', nilai: 83 },
  { bulan: 'Okt', nilai: 82 },
  { bulan: 'Nov', nilai: 86 },
  { bulan: 'Des', nilai: 85 }
];

const hafalanData = [
  { name: 'Lancar', value: 120, color: '#059669' },
  { name: 'Murajaah', value: 58, color: '#d97706' },
  { name: 'Perbaikan', value: 25, color: '#e11d48' }
];

const setoranData = [
  { kelas: '1A', setoran: 48 },
  { kelas: '2A', setoran: 64 },
  { kelas: '3A', setoran: 52 },
  { kelas: '4A', setoran: 71 },
  { kelas: '5A', setoran: 68 }
];

const progressHafalan = [
  { label: 'Juz 30', value: 82 },
  { label: 'Juz 29', value: 64 },
  { label: 'Juz 1', value: 38 }
];

const perhatianRows = [
  { id: '1', nama: 'Ahmad Fauzi', kelas: '3A', masalah: 'Nilai Matematika rendah', status: 'perlu_perbaikan' },
  { id: '2', nama: 'Fatimah Azzahra', kelas: '2B', masalah: 'Hafalan murajaah', status: 'murajaah' },
  { id: '3', nama: 'Umar Hakim', kelas: '4A', masalah: 'Belum setor pekan ini', status: 'baru' }
];

const columns = [
  { key: 'nama', header: 'Nama' },
  { key: 'kelas', header: 'Kelas' },
  { key: 'masalah', header: 'Catatan' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
];

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  if (currentUser?.role === ROLES.ORANG_TUA) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Dashboard Orang Tua"
          title={`Selamat Datang, ${currentUser.nama}`}
          description="Pantau perkembangan nilai dan hafalan anak Anda."
        />
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-emerald-900">Akses Laporan Anak</h3>
              <p className="mt-1 text-sm text-emerald-800">Lihat laporan lengkap nilai akademik dan hafalan anak Anda di menu Laporan Siswa.</p>
              <a href="/laporan-siswa" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                <FileText className="h-4 w-4" />
                Buka Laporan Siswa
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan Operasional"
        title="Dashboard"
        description="Pantau nilai akademik, setoran hafalan, dan siswa yang membutuhkan perhatian."
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <School className="h-4 w-4" />
            Tahun 2026/2027
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Tren Rata-rata Nilai</h2>
              <p className="text-sm text-slate-500">Data dummy untuk tampilan dashboard awal.</p>
            </div>
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nilaiData} margin={{ left: -20, right: 12 }}>
                <defs>
                  <linearGradient id="nilaiGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="nilai" stroke="#059669" strokeWidth={3} fill="url(#nilaiGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-950">Status Hafalan</h2>
            <p className="text-sm text-slate-500">Komposisi status setoran.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={hafalanData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
                  {hafalanData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {hafalanData.map((item) => (
              <div className="flex items-center justify-between text-sm" key={item.name}>
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong className="text-slate-950">{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">Progress Hafalan</h3>
              <span className="text-xs font-medium text-slate-500">Target semester</span>
            </div>
            {progressHafalan.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-950">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-950">Setoran per Kelas</h2>
            <p className="text-sm text-slate-500">Perbandingan jumlah setoran bulan ini.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setoranData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="kelas" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="setoran" radius={[8, 8, 0, 0]} fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Siswa Perlu Perhatian</h2>
              <p className="text-sm text-slate-500">Daftar prioritas wali kelas dan guru.</p>
            </div>
            <StatusBadge status="perlu_perbaikan">3 siswa</StatusBadge>
          </div>
          <DataTable
            columns={columns}
            rows={perhatianRows}
            keyField="id"
            emptyTitle="Tidak ada siswa prioritas"
            emptyDescription="Siswa prioritas akan tampil ketika data nilai dan hafalan tersedia."
          />
        </section>
      </div>

      <section className="print-area rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Preview Laporan Cetak</h2>
            <p className="text-sm text-slate-500">Area ini memakai gaya ramah print untuk laporan siswa.</p>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => window.print()} type="button">
            Cetak
          </button>
        </div>
        <EmptyState title="Laporan belum dipilih" description="Pilih siswa dan tahun ajaran pada modul laporan untuk mencetak." />
      </section>
    </section>
  );
}
