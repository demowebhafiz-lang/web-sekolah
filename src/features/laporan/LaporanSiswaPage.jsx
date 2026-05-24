import { Printer } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const student = {
  nama: 'Ahmad Fauzi',
  nis: '2026001',
  kelas: '3A',
  semester: 'Ganjil',
  tahunAjaran: '2026/2027',
  waliKelas: 'Ustadzah Aminah',
  fotoUrl: ''
};

const nilaiRows = [
  { mapel: 'Al-Qur’an Hadits', harian: 88, tugas: 90, pts: 86, pas: 89, rata: 88.3, predikat: 'B' },
  { mapel: 'Akidah Akhlak', harian: 92, tugas: 91, pts: 90, pas: 93, rata: 91.5, predikat: 'A' },
  { mapel: 'Matematika', harian: 78, tugas: 82, pts: 80, pas: 84, rata: 81.0, predikat: 'B' },
  { mapel: 'Bahasa Indonesia', harian: 85, tugas: 87, pts: 84, pas: 88, rata: 86.0, predikat: 'B' }
];

const hafalanRows = [
  { juz: 30, surah: 'An-Naba', ayat: '1-40', status: 'selesai', rata: 91.2, catatan: 'Lancar dan stabil' },
  { juz: 30, surah: 'An-Naziat', ayat: '1-25', status: 'lancar', rata: 87.5, catatan: 'Tajwid baik' },
  { juz: 30, surah: 'Abasa', ayat: '1-16', status: 'murajaah', rata: 78.0, catatan: 'Perlu penguatan murajaah' }
];

export default function LaporanSiswaPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Laporan"
        title="Laporan Siswa"
        description="Preview laporan perkembangan akademik dan hafalan yang siap dicetak."
        actions={
          <button
            className="no-print inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            type="button"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Cetak
          </button>
        }
      />

      <article className="print-area mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <ReportHeader />
        <StudentInfo />
        <ReportSection title="A. Nilai Akademik">
          <div className="overflow-x-auto">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mata Pelajaran</th>
                  <th>Harian</th>
                  <th>Tugas</th>
                  <th>PTS</th>
                  <th>PAS</th>
                  <th>Rata-rata</th>
                  <th>Predikat</th>
                </tr>
              </thead>
              <tbody>
                {nilaiRows.map((row) => (
                  <tr key={row.mapel}>
                    <td className="font-medium text-slate-950">{row.mapel}</td>
                    <td>{row.harian}</td>
                    <td>{row.tugas}</td>
                    <td>{row.pts}</td>
                    <td>{row.pas}</td>
                    <td>{row.rata.toFixed(1)}</td>
                    <td><PredikatBadge value={row.predikat} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection title="B. Hafalan Al-Qur'an">
          <div className="overflow-x-auto">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Juz</th>
                  <th>Surah</th>
                  <th>Ayat</th>
                  <th>Status</th>
                  <th>Rata-rata</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {hafalanRows.map((row) => (
                  <tr key={`${row.juz}-${row.surah}`}>
                    <td>{row.juz}</td>
                    <td className="font-medium text-slate-950">{row.surah}</td>
                    <td>{row.ayat}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.rata.toFixed(1)}</td>
                    <td>{row.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection title="C. Catatan Wali Kelas">
          <div className="min-h-28 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 print:bg-white">
            Ahmad menunjukkan perkembangan yang baik dalam hafalan dan adab belajar. Murajaah perlu dijaga secara rutin di rumah agar hafalan semakin kuat.
          </div>
        </ReportSection>

        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-sm text-slate-700">
          <SignatureBlock title="Wali Kelas" name={student.waliKelas} />
          <SignatureBlock title="Kepala Madrasah" name="Ustadz Abdullah" />
        </div>
      </article>
    </section>
  );
}

function ReportHeader() {
  return (
    <header className="report-header flex items-center gap-4 border-b-2 border-slate-900 pb-5">
      <SchoolLogo className="h-16 w-16 rounded-2xl print:border print:border-slate-900" fallbackClassName="bg-emerald-600 text-white print:bg-white print:text-slate-900" />
      <div className="text-center sm:flex-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 print:text-slate-900">Madrasah Tahfidz</p>
        <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-slate-950">Madrasah Nurul Qur'an</h2>
        <p className="mt-1 text-sm text-slate-600">Jl. Pendidikan Islam No. 12, Kota Madani · Telp. 021-000000</p>
      </div>
    </header>
  );
}

function StudentInfo() {
  const items = [
    ['Nama', student.nama],
    ['NIS', student.nis],
    ['Kelas', student.kelas],
    ['Semester', student.semester],
    ['Tahun Ajaran', student.tahunAjaran],
    ['Wali Kelas', student.waliKelas]
  ];

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 print:bg-white">
      <h1 className="text-center text-xl font-bold uppercase tracking-wide text-slate-950">Laporan Perkembangan Siswa</h1>
      <div className="mt-5 grid gap-5 sm:grid-cols-[120px_1fr]">
        <div className="grid place-items-start">
          <AvatarImage className="h-24 w-24 rounded-xl text-2xl print:border print:border-slate-400" name={student.nama} src={student.fotoUrl} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(([label, value]) => (
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm" key={label}>
              <span className="font-semibold text-slate-600">{label}</span>
              <span className="text-slate-950">: {value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportSection({ title, children }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 text-base font-bold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function PredikatBadge({ value }) {
  const styles = {
    A: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    B: 'bg-sky-50 text-sky-700 ring-sky-200',
    C: 'bg-amber-50 text-amber-700 ring-amber-200',
    D: 'bg-rose-50 text-rose-700 ring-rose-200'
  };

  return (
    <span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-bold ring-1 ${styles[value]}`}>
      {value}
    </span>
  );
}

function SignatureBlock({ title, name }) {
  return (
    <div>
      <p>{title}</p>
      <div className="h-20" />
      <p className="font-semibold underline underline-offset-4">{name}</p>
    </div>
  );
}
