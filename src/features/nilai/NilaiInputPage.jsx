import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, Loader2, Save, Sparkles } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { cn } from '../../lib/utils.js';
import { getKelasList } from '../kelas/kelasService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { bulkSaveNilai } from './nilaiService.js';

const initialFilters = {
  kelasId: '',
  mapelId: '',
  semester: 'Ganjil',
  tahunAjaran: '2026/2027',
  jenisNilai: 'harian'
};

const jenisNilaiOptions = [
  { value: 'harian', label: 'Harian' },
  { value: 'tugas', label: 'Tugas' },
  { value: 'praktik', label: 'Praktik' },
  { value: 'PTS', label: 'PTS' },
  { value: 'PAS', label: 'PAS' }
];

export default function NilaiInputPage() {
  const { showToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [kelasRows, setKelasRows] = useState([]);
  const [error, setError] = useState('');
  const [kelasError, setKelasError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filledRows = useMemo(
    () => rows.filter((row) => row.nilai !== '' && row.nilai !== null && row.nilai !== undefined),
    [rows]
  );
  const invalidRows = useMemo(
    () => filledRows.filter((row) => !isValidScore(row.nilai)),
    [filledRows]
  );
  const average = useMemo(() => {
    const valid = filledRows.filter((row) => isValidScore(row.nilai));
    if (!valid.length) return 0;
    return valid.reduce((sum, row) => sum + Number(row.nilai), 0) / valid.length;
  }, [filledRows]);
  const isReadyToSave = Boolean(filters.kelasId && filters.mapelId && filters.semester && filters.tahunAjaran && filters.jenisNilai);

  useEffect(() => {
    setIsLoadingKelas(true);
    getKelasList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setKelasRows(data.items || []);
        setKelasError('');
      })
      .catch((err) => setKelasError(err.message || 'Gagal memuat data kelas.'))
      .finally(() => setIsLoadingKelas(false));
  }, []);

  useEffect(() => {
    if (!filters.kelasId) {
      setRows([]);
      setError('');
      return;
    }

    loadStudentsByClass(filters.kelasId);
  }, [filters.kelasId]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function validateFilters() {
    if (!filters.kelasId.trim()) return 'Kelas ID wajib diisi.';
    if (!filters.mapelId.trim()) return 'Mapel ID wajib diisi.';
    if (!filters.semester) return 'Semester wajib dipilih.';
    if (!filters.tahunAjaran.trim()) return 'Tahun ajaran wajib diisi.';
    if (!filters.jenisNilai) return 'Jenis nilai wajib dipilih.';
    return '';
  }

  async function loadStudentsByClass(kelasId) {
    setError('');
    setIsLoading(true);

    try {
      const data = await getSiswaList({
        kelasId,
        status: 'aktif',
        page: 1,
        limit: 100
      });

      const nextRows = (data.items || []).map((student) => ({
        siswaId: student.siswaId,
        nis: student.nis,
        namaLengkap: student.namaLengkap,
        nilai: '',
        catatan: ''
      }));

      setRows(nextRows);
    } catch (err) {
      setRows([]);
      const message = err.message || 'Gagal memuat siswa';
      setError(message);
      showToast({ title: 'Gagal memuat siswa', description: message, variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  function handleRowChange(siswaId, field, value) {
    setRows((current) =>
      current.map((row) => (row.siswaId === siswaId ? { ...row, [field]: value } : row))
    );
  }

  function validateRows() {
    if (!rows.length) return 'Tampilkan siswa terlebih dahulu.';
    if (!filledRows.length) return 'Isi minimal satu nilai siswa.';
    if (invalidRows.length) return `${invalidRows.length} nilai tidak valid. Nilai harus 0 sampai 100.`;
    return '';
  }

  async function handleSave() {
    const filterMessage = validateFilters();
    const rowMessage = validateRows();

    if (filterMessage || rowMessage) {
      const message = filterMessage || rowMessage;
      setError(message);
      showToast({ title: 'Tidak bisa menyimpan', description: message, variant: 'error' });
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const data = await bulkSaveNilai({
        ...filters,
        items: filledRows
      });

      showToast({
        title: 'Nilai berhasil disimpan',
        description: `${data.totalSaved || filledRows.length} nilai tersimpan ke backend.`,
        variant: 'success'
      });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan nilai';
      setError(message);
      showToast({ title: 'Gagal menyimpan nilai', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6 pb-28">
      <PageHeader
        eyebrow="Nilai Akademik"
        title="Input Nilai"
        description="Input nilai massal per kelas dengan pengalaman seperti spreadsheet, lengkap dengan predikat otomatis."
        actions={
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            <Sparkles className="h-4 w-4" />
            Predikat otomatis
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectInput label="Kelas" name="kelasId" value={filters.kelasId} onChange={handleFilterChange} disabled={isLoadingKelas}>
            <option value="">{isLoadingKelas ? 'Memuat kelas...' : 'Pilih kelas'}</option>
            {kelasRows.map((kelas) => (
              <option key={kelas.kelasId} value={kelas.kelasId}>
                {kelas.namaKelas || kelas.kelasId}
              </option>
            ))}
          </SelectInput>
          <Field label="Mapel">
            <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="mapelId" value={filters.mapelId} onChange={handleFilterChange} placeholder="MPL001" />
          </Field>
          <SelectInput label="Semester" name="semester" value={filters.semester} onChange={handleFilterChange}>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </SelectInput>
          <Field label="Tahun Ajaran">
            <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="tahunAjaran" value={filters.tahunAjaran} onChange={handleFilterChange} placeholder="2026/2027" />
          </Field>
          <SelectInput label="Jenis Nilai" name="jenisNilai" value={filters.jenisNilai} onChange={handleFilterChange}>
            {jenisNilaiOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">
          Pilih kelas untuk memuat siswa aktif otomatis. Guru tidak perlu memilih siswa satu per satu.
        </p>
      </div>

      {kelasError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {kelasError}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Siswa tampil" value={rows.length} icon={ClipboardList} />
        <SummaryCard label="Nilai terisi" value={filledRows.length} icon={CheckCircle2} />
        <SummaryCard label="Rata-rata valid" value={average ? average.toFixed(1) : '0.0'} icon={BookOpen} />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Tabel Input Nilai</h2>
            <p className="text-sm text-slate-500">Kolom nilai menerima angka 0-100. Predikat muncul otomatis.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <PredikatBadge predikat="A" />
            <PredikatBadge predikat="B" />
            <PredikatBadge predikat="C" />
            <PredikatBadge predikat="D" />
          </div>
        </div>

        {!filters.kelasId ? (
          <div className="p-5">
            <EmptyState
              title="Pilih kelas terlebih dahulu"
              description="Setelah kelas dipilih, siswa aktif di kelas tersebut akan tampil otomatis."
            />
          </div>
        ) : isLoading ? (
          <div className="p-5">
            <LoadingState label="Memuat siswa aktif..." />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">NIS</th>
                  <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                  <th className="w-36 px-4 py-3 font-semibold">Nilai</th>
                  <th className="w-32 px-4 py-3 font-semibold">Predikat</th>
                  <th className="px-4 py-3 font-semibold">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isInvalid = row.nilai !== '' && !isValidScore(row.nilai);
                  const predikat = isValidScore(row.nilai) ? getPredikat(Number(row.nilai)) : '';

                  return (
                    <tr className={cn('border-t border-slate-100 transition hover:bg-slate-50', isInvalid && 'bg-rose-50/60 hover:bg-rose-50')} key={row.siswaId}>
                      <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.nis || '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-950">{row.namaLengkap || '-'}</p>
                          <p className="text-xs text-slate-500">{row.siswaId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={cn(
                            'h-10 w-24 rounded-lg border bg-white px-3 text-center font-semibold text-slate-950 outline-none transition focus:ring-2',
                            isInvalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                          )}
                          inputMode="decimal"
                          max="100"
                          min="0"
                          type="number"
                          value={row.nilai}
                          onChange={(event) => handleRowChange(row.siswaId, 'nilai', event.target.value)}
                        />
                        {isInvalid ? <p className="mt-1 text-xs font-medium text-rose-600">0-100</p> : null}
                      </td>
                      <td className="px-4 py-3">
                        {predikat ? <PredikatBadge predikat={predikat} /> : <span className="text-xs text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="h-10 w-full min-w-64 rounded-lg border border-slate-200 bg-white px-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          value={row.catatan}
                          onChange={(event) => handleRowChange(row.siswaId, 'catatan', event.target.value)}
                          placeholder="Opsional"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="Belum ada siswa di kelas ini"
              description="Pilih kelas lain atau tambahkan siswa aktif ke kelas tersebut."
            />
          </div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:left-72">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-slate-950">{filledRows.length} nilai siap disimpan</p>
            <p className={cn('text-slate-500', invalidRows.length && 'font-medium text-rose-600')}>
              {invalidRows.length ? `${invalidRows.length} nilai perlu diperbaiki` : 'Validasi nilai 0-100 aktif'}
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isReadyToSave || invalidRows.length > 0}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Semua
          </button>
        </div>
      </div>
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

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <strong className="mt-1 block text-2xl font-semibold text-slate-950">{value}</strong>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function PredikatBadge({ predikat }) {
  const classes = {
    A: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    B: 'bg-sky-50 text-sky-700 ring-sky-200',
    C: 'bg-amber-50 text-amber-700 ring-amber-200',
    D: 'bg-rose-50 text-rose-700 ring-rose-200'
  };

  return (
    <span className={cn('inline-flex min-w-8 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1', classes[predikat])}>
      {predikat}
    </span>
  );
}

function isValidScore(value) {
  const number = Number(value);
  return value !== '' && !Number.isNaN(number) && number >= 0 && number <= 100;
}

function getPredikat(nilai) {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
}
