import { cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, CheckCircle2, Loader2, Save, Sparkles, UserRound } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { cn } from '../../lib/utils.js';
import { getKelasList } from '../kelas/kelasService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { createHafalan, getRiwayatHafalanSiswa } from './hafalanService.js';

const initialForm = {
  kelasId: '',
  siswaId: '',
  juz: '30',
  surah: '',
  nomorSurah: '',
  ayatAwal: '',
  ayatAkhir: '',
  tanggalSetor: new Date().toISOString().slice(0, 10),
  statusHafalan: 'lancar',
  nilaiKelancaran: '',
  nilaiTajwid: '',
  nilaiMakhraj: '',
  nilaiAdab: '',
  catatan: ''
};

const statusOptions = [
  { value: 'baru', label: 'Baru' },
  { value: 'lancar', label: 'Lancar' },
  { value: 'perlu_perbaikan', label: 'Perlu Perbaikan' },
  { value: 'murajaah', label: 'Murajaah' },
  { value: 'selesai', label: 'Selesai' }
];

export default function HafalanInputPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [kelasRows, setKelasRows] = useState([]);
  const [siswaRows, setSiswaRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [kelasError, setKelasError] = useState('');
  const [siswaError, setSiswaError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedStudent = useMemo(
    () => siswaRows.find((student) => String(student.siswaId) === String(form.siswaId)) || null,
    [form.siswaId, siswaRows]
  );
  const rataRata = useMemo(() => {
    const scores = [
      form.nilaiKelancaran,
      form.nilaiTajwid,
      form.nilaiMakhraj,
      form.nilaiAdab
    ].map(Number);

    if (scores.some((score) => Number.isNaN(score))) return '';
    return (scores.reduce((sum, score) => sum + score, 0) / 4).toFixed(1);
  }, [form.nilaiAdab, form.nilaiKelancaran, form.nilaiMakhraj, form.nilaiTajwid]);
  const progress = useMemo(() => {
    const latest = history[0];
    if (latest?.rataRata) {
      return Math.min(100, Math.round(Number(latest.rataRata)));
    }

    const juz = Number(form.juz);
    const start = Number(form.ayatAwal);
    const end = Number(form.ayatAkhir);

    if (Number.isNaN(juz) || Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return 0;
    }

    return Math.min(100, Math.round(((end - start + 1) / 40) * 100));
  }, [form.ayatAkhir, form.ayatAwal, form.juz, history]);

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
    if (!form.kelasId) {
      setSiswaRows([]);
      setHistory([]);
      setSiswaError('');
      setHistoryError('');
      return;
    }

    setIsLoadingSiswa(true);
    setSiswaError('');
    setHistory([]);
    setForm((current) => ({ ...current, siswaId: '' }));

    getSiswaList({ kelasId: form.kelasId, status: 'aktif', page: 1, limit: 200 })
      .then((data) => setSiswaRows(data.items || []))
      .catch((err) => {
        setSiswaRows([]);
        setSiswaError(err.message || 'Gagal memuat siswa di kelas ini.');
      })
      .finally(() => setIsLoadingSiswa(false));
  }, [form.kelasId]);

  useEffect(() => {
    if (!form.siswaId) {
      setHistory([]);
      setHistoryError('');
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError('');

    getRiwayatHafalanSiswa({ siswaId: form.siswaId })
      .then((data) => setHistory(data.items || []))
      .catch((err) => {
        setHistory([]);
        setHistoryError(err.message || 'Gagal memuat riwayat hafalan siswa.');
      })
      .finally(() => setIsLoadingHistory(false));
  }, [form.siswaId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const requiredFields = [
      ['kelasId', 'Kelas'],
      ['siswaId', 'Siswa'],
      ['juz', 'Juz'],
      ['surah', 'Surah'],
      ['nomorSurah', 'Nomor surah'],
      ['ayatAwal', 'Ayat awal'],
      ['ayatAkhir', 'Ayat akhir'],
      ['tanggalSetor', 'Tanggal setor'],
      ['nilaiKelancaran', 'Nilai kelancaran'],
      ['nilaiTajwid', 'Nilai tajwid'],
      ['nilaiMakhraj', 'Nilai makhraj'],
      ['nilaiAdab', 'Nilai adab']
    ];

    const missing = requiredFields.find(([field]) => String(form[field]).trim() === '');
    if (missing) return `${missing[1]} wajib diisi.`;

    if (!isInRange(form.juz, 1, 30)) return 'Juz harus 1 sampai 30.';
    if (!isInRange(form.nomorSurah, 1, 114)) return 'Nomor surah harus 1 sampai 114.';
    if (Number(form.ayatAwal) > Number(form.ayatAkhir)) return 'Ayat awal tidak boleh lebih besar dari ayat akhir.';

    const scoreFields = [
      ['nilaiKelancaran', 'Nilai kelancaran'],
      ['nilaiTajwid', 'Nilai tajwid'],
      ['nilaiMakhraj', 'Nilai makhraj'],
      ['nilaiAdab', 'Nilai adab']
    ];
    const invalidScore = scoreFields.find(([field]) => !isInRange(form[field], 1, 100));
    if (invalidScore) return `${invalidScore[1]} harus 1 sampai 100.`;

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      showToast({ title: 'Validasi hafalan gagal', description: validationMessage, variant: 'error' });
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const data = await createHafalan(form);
      const average = data.rataRata ? Number(data.rataRata).toFixed(1) : rataRata;

      showToast({
        title: 'Hafalan berhasil disimpan',
        description: `Rata-rata bacaan ${average}.`,
        variant: 'success'
      });

      setForm((current) => ({
        ...initialForm,
        kelasId: current.kelasId,
        siswaId: current.siswaId,
        tanggalSetor: current.tanggalSetor
      }));

      const nextHistory = await getRiwayatHafalanSiswa({ siswaId: form.siswaId });
      setHistory(nextHistory.items || []);
    } catch (err) {
      const message = err.message || 'Gagal menyimpan hafalan';
      setError(message);
      showToast({ title: 'Gagal menyimpan hafalan', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        eyebrow="Hafalan Al-Qur'an"
        title="Input Hafalan"
        description="Pilih kelas terlebih dahulu, lalu pilih siswa dari kelas tersebut untuk memuat riwayat otomatis."
        actions={<StatusBadge status={form.statusHafalan} />}
      />

      {kelasError ? <InlineAlert tone="warning" message={kelasError} /> : null}
      {siswaError ? <InlineAlert tone="error" message={siswaError} /> : null}
      {historyError ? <InlineAlert tone="warning" message={historyError} /> : null}
      {error ? <InlineAlert tone="error" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <SectionCard
            icon={UserRound}
            title="Data Siswa"
            description="Dropdown siswa otomatis mengikuti kelas yang dipilih."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label="Kelas" name="kelasId" value={form.kelasId} onChange={handleChange} disabled={isLoadingKelas}>
                <option value="">{isLoadingKelas ? 'Memuat kelas...' : 'Pilih kelas'}</option>
                {kelasRows.map((kelas) => (
                  <option key={kelas.kelasId} value={kelas.kelasId}>
                    {kelas.namaKelas || kelas.kelasId}
                  </option>
                ))}
              </SelectInput>
              <SelectInput label="Siswa" name="siswaId" value={form.siswaId} onChange={handleChange} disabled={!form.kelasId || isLoadingSiswa || !siswaRows.length}>
                <option value="">
                  {!form.kelasId ? 'Pilih kelas terlebih dahulu' : isLoadingSiswa ? 'Memuat siswa...' : siswaRows.length ? 'Pilih siswa' : 'Belum ada siswa di kelas ini'}
                </option>
                {siswaRows.map((student) => (
                  <option key={student.siswaId} value={student.siswaId}>
                    {student.namaLengkap || student.siswaId}
                  </option>
                ))}
              </SelectInput>
            </div>

            {form.kelasId && !isLoadingSiswa && !siswaRows.length ? (
              <div className="mt-4">
                <EmptyState title="Belum ada siswa di kelas ini" description="Tambahkan siswa aktif ke kelas tersebut atau pilih kelas lain." />
              </div>
            ) : null}

            {selectedStudent ? (
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <AvatarImage className="h-16 w-16 text-lg" name={selectedStudent.namaLengkap} src={selectedStudent.fotoUrl} />
                <div>
                  <p className="font-semibold text-slate-950">{selectedStudent.namaLengkap || '-'}</p>
                  <p className="text-sm text-slate-500">NIS {selectedStudent.nis || '-'} · Kelas {selectedStudent.kelasId || form.kelasId}</p>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            icon={BookOpenCheck}
            title="Setoran Hafalan"
            description="Isi rentang ayat dan status setoran."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Juz">
                <input name="juz" type="number" min="1" max="30" value={form.juz} onChange={handleChange} required />
              </Field>
              <Field label="Surah">
                <input name="surah" value={form.surah} onChange={handleChange} placeholder="An-Naba" required />
              </Field>
              <Field label="Nomor Surah">
                <input name="nomorSurah" type="number" min="1" max="114" value={form.nomorSurah} onChange={handleChange} required />
              </Field>
              <Field label="Ayat Awal">
                <input name="ayatAwal" type="number" min="1" value={form.ayatAwal} onChange={handleChange} required />
              </Field>
              <Field label="Ayat Akhir">
                <input name="ayatAkhir" type="number" min="1" value={form.ayatAkhir} onChange={handleChange} required />
              </Field>
              <Field label="Tanggal Setor">
                <input name="tanggalSetor" type="date" value={form.tanggalSetor} onChange={handleChange} required />
              </Field>
              <SelectInput label="Status Hafalan" name="statusHafalan" value={form.statusHafalan} onChange={handleChange}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
              <div className="md:col-span-2">
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  Catatan
                  <textarea
                    className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    name="catatan"
                    value={form.catatan}
                    onChange={handleChange}
                    placeholder="Catatan bacaan atau target murajaah"
                  />
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Sparkles}
            title="Penilaian Bacaan"
            description="Nilai setiap aspek 1-100. Rata-rata dihitung otomatis."
          >
            <div className="grid gap-4 md:grid-cols-4">
              <ScoreField label="Kelancaran" name="nilaiKelancaran" value={form.nilaiKelancaran} onChange={handleChange} />
              <ScoreField label="Tajwid" name="nilaiTajwid" value={form.nilaiTajwid} onChange={handleChange} />
              <ScoreField label="Makhraj" name="nilaiMakhraj" value={form.nilaiMakhraj} onChange={handleChange} />
              <ScoreField label="Adab" name="nilaiAdab" value={form.nilaiAdab} onChange={handleChange} />
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Rata-rata Bacaan</p>
                  <p className="text-sm text-slate-500">Dihitung dari kelancaran, tajwid, makhraj, dan adab.</p>
                </div>
                <strong className="text-3xl font-semibold text-emerald-700">{rataRata || '-'}</strong>
              </div>
            </div>
          </SectionCard>

          <div className="sticky bottom-3 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-950">Siap menyimpan setoran</p>
                  <p className="text-slate-500">Pastikan kelas, siswa, status, dan nilai bacaan sudah benar.</p>
                </div>
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70" type="submit" disabled={isSaving || !form.kelasId || !form.siswaId}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Hafalan
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Progress Hafalan Siswa</h2>
                <p className="mt-1 text-sm text-slate-500">Mengikuti siswa yang dipilih.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Progress terakhir</span>
                <span className="font-semibold text-slate-950">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric label="Siswa" value={selectedStudent?.namaLengkap || '-'} />
              <MiniMetric label="Status" value={<StatusBadge status={form.statusHafalan} />} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-950">Riwayat Terakhir</h2>
              <p className="mt-1 text-sm text-slate-500">Riwayat dimuat otomatis setelah siswa dipilih.</p>
            </div>
            {!form.siswaId ? (
              <EmptyState title="Pilih siswa" description="Riwayat hafalan akan tampil setelah siswa dipilih." />
            ) : isLoadingHistory ? (
              <LoadingState label="Memuat riwayat hafalan..." />
            ) : history.length ? (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <article className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={item.hafalanId || `${item.siswaId}-${item.tanggalSetor}-${item.ayatAwal}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.surah || '-'}</p>
                        <p className="text-xs text-slate-500">Juz {item.juz || '-'} · Ayat {item.ayatAwal || '-'}-{item.ayatAkhir || '-'}</p>
                      </div>
                      <StatusBadge status={item.statusHafalan || 'baru'} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{item.tanggalSetor || '-'}</span>
                      <span className="font-semibold text-slate-700">Rata {formatNumber(item.rataRata)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada riwayat" description="Siswa ini belum memiliki setoran hafalan." />
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  const control = isValidElement(children)
    ? cloneElement(children, {
      className: cn(
        'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
        children.props.className
      )
    })
    : children;

  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {control}
    </label>
  );
}

function ScoreField({ label, name, value, onChange }) {
  const invalid = value !== '' && !isInRange(value, 1, 100);

  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <input
        className={cn(
          'h-11 rounded-lg border bg-white px-3 text-center text-lg font-semibold text-slate-950 outline-none transition focus:ring-2',
          invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
        )}
        name={name}
        type="number"
        min="1"
        max="100"
        value={value}
        onChange={onChange}
        required
      />
      {invalid ? <span className="text-xs font-medium text-rose-600">1-100</span> : null}
    </label>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function InlineAlert({ message, tone = 'error' }) {
  const className = tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-rose-200 bg-rose-50 text-rose-700';

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${className}`}>{message}</div>;
}

function isInRange(value, min, max) {
  const number = Number(value);
  return !Number.isNaN(number) && number >= min && number <= max;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '-' : number.toFixed(1);
}
