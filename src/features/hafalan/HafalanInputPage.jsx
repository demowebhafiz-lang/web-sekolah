import { useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, CheckCircle2, Loader2, Save, Sparkles, UserRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { cn } from '../../lib/utils.js';
import { createHafalan } from './hafalanService.js';

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

const initialHistory = [
  { id: 'demo-1', tanggalSetor: '2026-05-20', surah: 'An-Naba', juz: 30, ayat: '1-10', statusHafalan: 'lancar', rataRata: 88 },
  { id: 'demo-2', tanggalSetor: '2026-05-17', surah: 'An-Naziat', juz: 30, ayat: '1-8', statusHafalan: 'murajaah', rataRata: 76 }
];

export default function HafalanInputPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState(initialHistory);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    const juz = Number(form.juz);
    const start = Number(form.ayatAwal);
    const end = Number(form.ayatAkhir);

    if (Number.isNaN(juz) || Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return 0;
    }

    return Math.min(100, Math.round(((end - start + 1) / 40) * 100));
  }, [form.ayatAkhir, form.ayatAwal, form.juz]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const requiredFields = [
      ['kelasId', 'Kelas ID'],
      ['siswaId', 'Siswa ID'],
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
      setHistory((current) => [
        {
          id: data.hafalanId || `${form.siswaId}-${Date.now()}`,
          tanggalSetor: form.tanggalSetor,
          surah: form.surah,
          juz: form.juz,
          ayat: `${form.ayatAwal}-${form.ayatAkhir}`,
          statusHafalan: form.statusHafalan,
          rataRata: average
        },
        ...current
      ].slice(0, 5));

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
        description="Catat setoran hafalan, nilai bacaan, dan status progres siswa dalam satu tampilan."
        actions={<StatusBadge status={form.statusHafalan} />}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <SectionCard
            icon={UserRound}
            title="Data Siswa"
            description="Identitas dasar siswa untuk relasi data hafalan."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Kelas ID">
                <input name="kelasId" value={form.kelasId} onChange={handleChange} placeholder="KLS001" required />
              </Field>
              <Field label="Siswa ID">
                <input name="siswaId" value={form.siswaId} onChange={handleChange} placeholder="SIS001" required />
              </Field>
            </div>
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
              <Field label="Status Hafalan">
                <select name="statusHafalan" value={form.statusHafalan} onChange={handleChange}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
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
                  <p className="text-slate-500">Pastikan status dan nilai bacaan sudah benar.</p>
                </div>
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70" type="submit" disabled={isSaving}>
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
                <p className="mt-1 text-sm text-slate-500">Estimasi dari rentang ayat input saat ini.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Progress setoran</span>
                <span className="font-semibold text-slate-950">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric label="Juz" value={form.juz || '-'} />
              <MiniMetric label="Status" value={<StatusBadge status={form.statusHafalan} />} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-950">Riwayat Terakhir</h2>
              <p className="mt-1 text-sm text-slate-500">Setoran terbaru siswa akan tampil di sini.</p>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <article className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.surah}</p>
                      <p className="text-xs text-slate-500">Juz {item.juz} · Ayat {item.ayat}</p>
                    </div>
                    <StatusBadge status={item.statusHafalan} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.tanggalSetor}</span>
                    <span className="font-semibold text-slate-700">Rata {Number(item.rataRata).toFixed(1)}</span>
                  </div>
                </article>
              ))}
            </div>
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
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {children}
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
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function isInRange(value, min, max) {
  const number = Number(value);
  return !Number.isNaN(number) && number >= min && number <= max;
}
