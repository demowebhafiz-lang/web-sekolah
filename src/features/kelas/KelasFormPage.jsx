import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { createKelas, getKelasList, updateKelas } from './kelasService.js';

const emptyForm = {
  kelasId: '',
  namaKelas: '',
  tingkat: '',
  waliKelasId: '',
  tahunAjaran: '2026/2027',
  status: 'aktif'
};

export default function KelasFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = params.kelasId ? 'edit' : 'create';
  const [form, setForm] = useState(() => ({ ...emptyForm, ...location.state?.kelas, kelasId: location.state?.kelas?.kelasId || params.kelasId || '' }));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.kelas);
  const [isSaving, setIsSaving] = useState(false);
  const title = useMemo(() => (mode === 'edit' ? 'Edit Kelas' : 'Tambah Kelas'), [mode]);

  useEffect(() => {
    if (mode !== 'edit' || location.state?.kelas) return;
    getKelasList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const kelas = (data.items || []).find((item) => String(item.kelasId) === String(params.kelasId));
        if (kelas) setForm({ ...emptyForm, ...kelas });
        else setError('Data kelas tidak ditemukan.');
      })
      .catch((err) => setError(err.message || 'Gagal memuat data kelas.'))
      .finally(() => setIsLoading(false));
  }, [location.state, mode, params.kelasId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    if (!form.namaKelas.trim()) return 'Nama kelas wajib diisi.';
    if (!form.tingkat.trim()) return 'Tingkat wajib diisi.';
    if (!form.tahunAjaran.trim()) return 'Tahun ajaran wajib diisi.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      showToast({ title: 'Periksa data kelas', description: validation, variant: 'error' });
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (mode === 'edit') await updateKelas(form);
      else await createKelas(form);
      navigate('/kelas', { replace: true, state: { message: mode === 'edit' ? 'Kelas berhasil diperbarui.' : 'Kelas berhasil ditambahkan.' } });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan kelas.';
      setError(message);
      showToast({ title: 'Gagal menyimpan kelas', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <FormCard title="Memuat data kelas"><p className="text-sm text-slate-500">Memuat data...</p></FormCard>;

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Data Master" title={title} description="Isi struktur kelas sesuai Sheet Kelas." actions={<Link className="button button-secondary" to="/kelas">Kembali</Link>} />
      {error ? <ErrorState description={error} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard title="Informasi Kelas" description="Kelas terhubung ke siswa, nilai, dan hafalan.">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === 'edit' ? <Field label="Kelas ID" name="kelasId" value={form.kelasId} onChange={handleChange} required /> : null}
            <Field label="Nama Kelas" name="namaKelas" value={form.namaKelas} onChange={handleChange} placeholder="1A" required />
            <Field label="Tingkat" name="tingkat" value={form.tingkat} onChange={handleChange} placeholder="1" required />
            <Field label="Wali Kelas ID" name="waliKelasId" value={form.waliKelasId} onChange={handleChange} placeholder="GR001" />
            <Field label="Tahun Ajaran" name="tahunAjaran" value={form.tahunAjaran} onChange={handleChange} required />
            <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </SelectField>
          </div>
        </FormCard>
        <Actions isSaving={isSaving} backTo="/kelas" />
      </form>
    </section>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function SelectField({ label, children, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props}>{children}</select></label>;
}

function Actions({ isSaving, backTo }) {
  return (
    <div className="flex justify-end gap-2">
      <Link className="button button-secondary" to={backTo}>Batal</Link>
      <button className="button button-primary gap-2" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </div>
  );
}
