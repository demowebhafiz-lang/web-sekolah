import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, Printer, Search } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import { getKelasList } from '../kelas/kelasService.js';
import { getRekapHafalan } from '../hafalan/hafalanService.js';
import { getRekapNilai } from '../nilai/nilaiService.js';
import { getAppSettings } from '../settings/settingsService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { getCurrentUser } from '../auth/authService.js';
import { ROLES } from '../auth/roles.js';

const initialFilters = {
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kelasId: '',
  siswaId: '',
  reportType: 'single'
};

export default function LaporanSiswaPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [kelasRows, setKelasRows] = useState([]);
  const [siswaRows, setSiswaRows] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState({});
  const [error, setError] = useState('');
  const [kelasError, setKelasError] = useState('');
  const [siswaError, setSiswaError] = useState('');
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const selectedStudent = useMemo(
    () => siswaRows.find((student) => String(student.siswaId) === String(filters.siswaId)) || null,
    [filters.siswaId, siswaRows]
  );
  const selectedClass = useMemo(
    () => kelasRows.find((kelas) => String(kelas.kelasId) === String(filters.kelasId)) || null,
    [filters.kelasId, kelasRows]
  );

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user?.role === ROLES.ORANG_TUA && user?.siswaId) {
      setFilters((current) => ({ ...current, siswaId: user.siswaId, reportType: 'single' }));
    }
  }, []);

  useEffect(() => {
    setIsLoadingKelas(true);
    getKelasList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setKelasRows(data.items || []);
        setKelasError('');
      })
      .catch((err) => setKelasError(err.message || 'Gagal memuat data kelas.'))
      .finally(() => setIsLoadingKelas(false));

    getAppSettings()
      .then(setSettings)
      .catch(() => setSettings({}));
  }, []);

  useEffect(() => {
    if (!filters.kelasId) {
      setSiswaRows([]);
      setReports([]);
      setSiswaError('');
      if (currentUser?.role !== ROLES.ORANG_TUA) {
        setFilters((current) => ({ ...current, siswaId: '' }));
      }
      return;
    }

    setIsLoadingSiswa(true);
    setSiswaError('');
    setReports([]);
    if (currentUser?.role !== ROLES.ORANG_TUA) {
      setFilters((current) => ({ ...current, siswaId: '' }));
    }

    getSiswaList({ kelasId: filters.kelasId, status: 'aktif', page: 1, limit: 200 })
      .then((data) => setSiswaRows(data.items || []))
      .catch((err) => {
        setSiswaRows([]);
        setSiswaError(err.message || 'Gagal memuat siswa di kelas ini.');
      })
      .finally(() => setIsLoadingSiswa(false));
  }, [filters.kelasId]);

  useEffect(() => {
    if (currentUser?.role === ROLES.ORANG_TUA && currentUser?.siswaId && filters.kelasId && filters.siswaId) {
      loadReports('single');
    }
  }, [currentUser, filters.kelasId, filters.siswaId]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function validateReport(nextType = filters.reportType) {
    if (!filters.tahunAjaran.trim()) return 'Tahun ajaran wajib diisi.';
    if (!filters.semester) return 'Semester wajib dipilih.';
    if (!filters.kelasId) return 'Kelas wajib dipilih.';
    if (nextType === 'single' && !filters.siswaId) return 'Siswa wajib dipilih untuk laporan per siswa.';
    if (!siswaRows.length) return 'Belum ada siswa aktif di kelas ini.';
    return '';
  }

  async function loadReports(nextType = filters.reportType, shouldPrint = false) {
    const validation = validateReport(nextType);
    if (validation) {
      setError(validation);
      showToast({ title: 'Filter laporan belum lengkap', description: validation, variant: 'error' });
      return;
    }

    const targetStudents = nextType === 'single'
      ? siswaRows.filter((student) => String(student.siswaId) === String(filters.siswaId))
      : siswaRows;

    setError('');
    setIsLoadingReport(true);

    try {
      const nextReports = await Promise.all(targetStudents.map((student) => buildStudentReport(student)));
      setReports(nextReports);

      if (!nextReports.length) {
        showToast({ title: 'Laporan kosong', description: 'Tidak ada siswa yang bisa ditampilkan.', variant: 'error' });
        return;
      }

      if (shouldPrint) {
        window.setTimeout(() => window.print(), 150);
      }
    } catch (err) {
      setReports([]);
      setError(err.message || 'Gagal memuat laporan dari backend.');
      showToast({ title: 'Gagal memuat laporan', description: err.message || 'Request gagal.', variant: 'error' });
    } finally {
      setIsLoadingReport(false);
    }
  }

  async function buildStudentReport(student) {
    const basePayload = {
      siswaId: student.siswaId,
      kelasId: filters.kelasId,
      semester: filters.semester,
      tahunAjaran: filters.tahunAjaran
    };

    const [nilaiData, hafalanData] = await Promise.all([
      getRekapNilai(basePayload),
      getRekapHafalan({ siswaId: student.siswaId, kelasId: filters.kelasId })
    ]);

    return {
      student,
      nilai: nilaiData.items || [],
      hafalan: hafalanData.items || [],
      nilaiSummary: nilaiData,
      hafalanSummary: hafalanData
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadReports(filters.reportType);
  }

  function handlePrintSingle() {
    loadReports('single', true);
  }

  function handlePrintClass() {
    loadReports('class', true);
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Laporan"
        title="Laporan Siswa"
        description={currentUser?.role === ROLES.ORANG_TUA ? "Lihat laporan nilai dan hafalan anak Anda." : "Pilih kelas dan siswa untuk laporan tunggal, atau cetak massal semua siswa dalam satu kelas."}
      />

      {currentUser?.role !== ROLES.ORANG_TUA ? (
        <form className="report-filter no-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Tahun Ajaran">
            <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="tahunAjaran" value={filters.tahunAjaran} onChange={handleFilterChange} placeholder="2026/2027" />
          </Field>
          <SelectInput label="Semester" name="semester" value={filters.semester} onChange={handleFilterChange}>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </SelectInput>
          <SelectInput label="Kelas" name="kelasId" value={filters.kelasId} onChange={handleFilterChange} disabled={isLoadingKelas}>
            <option value="">{isLoadingKelas ? 'Memuat kelas...' : 'Pilih kelas'}</option>
            {kelasRows.map((kelas) => (
              <option key={kelas.kelasId} value={kelas.kelasId}>
                {kelas.namaKelas || kelas.kelasId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Siswa" name="siswaId" value={filters.siswaId} onChange={handleFilterChange} disabled={!filters.kelasId || isLoadingSiswa || !siswaRows.length}>
            <option value="">
              {!filters.kelasId ? 'Pilih kelas dahulu' : isLoadingSiswa ? 'Memuat siswa...' : siswaRows.length ? 'Pilih siswa' : 'Belum ada siswa'}
            </option>
            {siswaRows.map((student) => (
              <option key={student.siswaId} value={student.siswaId}>
                {student.namaLengkap || student.siswaId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Jenis Laporan" name="reportType" value={filters.reportType} onChange={handleFilterChange}>
            <option value="single">Laporan Per Siswa</option>
            <option value="class">Laporan Per Kelas / Cetak Massal</option>
          </SelectInput>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="button button-primary gap-2" type="submit" disabled={isLoadingReport}>
            {isLoadingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Tampilkan Laporan
          </button>
          <button className="button button-secondary gap-2" type="button" onClick={handlePrintSingle} disabled={isLoadingReport || !filters.kelasId || !filters.siswaId}>
            <Printer className="h-4 w-4" />
            Cetak Siswa Terpilih
          </button>
          <button className="button button-secondary gap-2" type="button" onClick={handlePrintClass} disabled={isLoadingReport || !filters.kelasId}>
            <Printer className="h-4 w-4" />
            Cetak Semua Siswa di Kelas
          </button>
        </div>
      </form>
      ) : null}

      {kelasError ? <InlineAlert tone="warning" message={kelasError} /> : null}
      {siswaError ? <InlineAlert tone="error" message={siswaError} /> : null}
      {error ? <ErrorState description={error} /> : null}

      {!filters.kelasId ? (
        <EmptyState title="Pilih kelas terlebih dahulu" description="Daftar siswa dan tombol cetak massal aktif setelah kelas dipilih." />
      ) : filters.kelasId && !isLoadingSiswa && !siswaRows.length ? (
        <EmptyState title="Belum ada siswa di kelas ini" description="Pilih kelas lain atau tambahkan siswa aktif ke kelas tersebut." />
      ) : selectedStudent && !reports.length && !isLoadingReport ? (
        <SelectedStudentPreview student={selectedStudent} kelas={selectedClass} />
      ) : null}

      {isLoadingReport ? <LoadingState label="Memuat laporan..." /> : null}

      {reports.length ? (
        <div className="space-y-6">
          {reports.map((report, index) => (
            <ReportPage
              key={report.student.siswaId}
              report={report}
              settings={settings}
              filters={filters}
              kelas={selectedClass}
              pageBreak={index < reports.length - 1}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SelectedStudentPreview({ student, kelas }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <AvatarImage className="h-16 w-16 text-lg" name={student.namaLengkap} src={student.fotoUrl} />
        <div>
          <h2 className="text-base font-semibold text-slate-950">{student.namaLengkap || '-'}</h2>
          <p className="text-sm text-slate-500">NIS {student.nis || '-'} · Kelas {kelas?.namaKelas || student.kelasId || '-'}</p>
        </div>
      </div>
    </section>
  );
}

function ReportPage({ report, settings, filters, kelas, pageBreak }) {
  const student = report.student;

  return (
    <article className={`report-page print-area mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm ${pageBreak ? 'print-page-break' : ''}`}>
      <ReportHeader settings={settings} />
      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 print:bg-white">
        <h1 className="text-center text-xl font-bold uppercase tracking-wide text-slate-950">Laporan Perkembangan Siswa</h1>
        <div className="mt-5 grid gap-5 sm:grid-cols-[120px_1fr]">
          <AvatarImage className="h-24 w-24 rounded-xl text-2xl print:border print:border-slate-400" name={student.namaLengkap} src={student.fotoUrl} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Nama" value={student.namaLengkap} />
            <Info label="NIS" value={student.nis} />
            <Info label="Kelas" value={kelas?.namaKelas || student.kelasId} />
            <Info label="Semester" value={filters.semester} />
            <Info label="Tahun Ajaran" value={filters.tahunAjaran} />
            <Info label="Status" value={student.status || 'aktif'} />
          </div>
        </div>
      </section>

      <ReportSection title="A. Nilai Akademik">
        {report.nilai.length ? (
          <div className="overflow-x-auto">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mapel</th>
                  <th>Jenis</th>
                  <th>Nilai</th>
                  <th>Predikat</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {report.nilai.map((row, index) => (
                  <tr key={row.nilaiId || `${row.mapelId}-${row.jenisNilai}-${index}`}>
                    <td className="font-medium text-slate-950">{row.namaMapel || row.mapelId || '-'}</td>
                    <td>{row.jenisNilai || '-'}</td>
                    <td>{row.nilai ?? '-'}</td>
                    <td>{row.predikat || '-'}</td>
                    <td>{row.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum ada nilai" description="Data nilai siswa belum tersedia untuk filter ini." />
        )}
      </ReportSection>

      <ReportSection title="B. Hafalan Al-Qur'an">
        {report.hafalan.length ? (
          <div className="overflow-x-auto">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Juz</th>
                  <th>Surah</th>
                  <th>Ayat</th>
                  <th>Status</th>
                  <th>Rata-rata</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {report.hafalan.map((row, index) => (
                  <tr key={row.hafalanId || `${row.surah}-${row.tanggalSetor}-${index}`}>
                    <td>{row.tanggalSetor || '-'}</td>
                    <td>{row.juz || '-'}</td>
                    <td className="font-medium text-slate-950">{row.surah || '-'}</td>
                    <td>{row.ayatAwal || '-'}-{row.ayatAkhir || '-'}</td>
                    <td><StatusBadge status={row.statusHafalan || 'baru'} /></td>
                    <td>{formatNumber(row.rataRata)}</td>
                    <td>{row.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum ada hafalan" description="Data hafalan siswa belum tersedia untuk filter ini." />
        )}
      </ReportSection>

      <ReportSection title="C. Catatan Wali Kelas">
        <div className="min-h-28 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 print:bg-white">
          Catatan wali kelas dapat ditambahkan pada tahap berikutnya.
        </div>
      </ReportSection>

      <div className="mt-10 grid grid-cols-2 gap-8 text-center text-sm text-slate-700">
        <SignatureBlock title="Wali Kelas" name="........................" />
        <SignatureBlock title="Kepala Madrasah" name="........................" />
      </div>
    </article>
  );
}

function ReportHeader({ settings }) {
  const logoUrl = settings.schoolLogoUrl || settings.logoUrl || '/logo.png';

  return (
    <header className="report-header flex items-center gap-4 border-b-2 border-slate-900 pb-5">
      <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 print:border print:border-slate-900 print:ring-0">
        {logoUrl ? (
          <img alt="Logo sekolah" className="h-full w-full object-contain p-1.5" src={logoUrl} />
        ) : (
          <SchoolLogo className="h-16 w-16 rounded-2xl print:border print:border-slate-900" fallbackClassName="bg-emerald-600 text-white print:bg-white print:text-slate-900" />
        )}
      </span>
      <div className="text-center sm:flex-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 print:text-slate-900">Laporan Sekolah</p>
        <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-slate-950">{settings.schoolName || 'Nama Sekolah'}</h2>
        <p className="mt-1 text-sm text-slate-600">{settings.schoolAddress || 'Alamat sekolah belum diatur'}</p>
      </div>
    </header>
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

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="text-slate-950">: {value || '-'}</span>
    </div>
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

function InlineAlert({ message, tone = 'error' }) {
  const className = tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-rose-200 bg-rose-50 text-rose-700';

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${className}`}>{message}</div>;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '-' : number.toFixed(1);
}
