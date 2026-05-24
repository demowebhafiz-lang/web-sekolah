import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { createGuru, getGuruList, updateGuru } from './guruService.js';

const emptyForm = {
  guruId: '',
  userId: '',
  namaGuru: '',
  email: '',
  noHp: '',
  roleGuru: 'guru_mapel',
  status: 'aktif'
};

export default function GuruFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = params.guruId ? 'edit' : 'create';
  const [form, setForm] = useState(() => ({ ...emptyForm, ...location.state?.guru, guruId: location.state?.guru?.guruId || params.guruId || '' }));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.guru);
  const [isSaving, setIsSaving] = useState(false);
  const title = useMemo(() => (mode === 'edit' ? 'Edit Guru' : 'Tambah Guru'), [mode]);

  useEffect(() => {
    if (mode !== 'edit' || location.state?.guru) return;
    getGuruList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const guru = (data.items || []).find((item) => String(item.guruId) === String(params.guruId));
        if (guru) setForm({ ...emptyForm, ...guru });
        else setError('Data guru tidak ditemukan.');
      })
      .catch((err) => setError(err.message || 'Gagal memuat data guru.'))
      .finally(() => setIsLoading(false));
  }, [location.state, mode, params.guruId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    if (!form.namaGuru.trim()) return 'Nama guru wajib diisi.';
    if (!form.email.trim()) return 'Email wajib diisi.';
    if (!form.roleGuru.trim()) return 'Role guru wajib dipilih.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      showToast({ title: 'Periksa data guru', description: validation, variant: 'error' });
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (mode === 'edit') await updateGuru(form);
      else await createGuru(form);
      navigate('/guru', { replace: true, state: { message: mode === 'edit' ? 'Guru berhasil diperbarui.' : 'Guru berhasil ditambahkan.' } });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan guru.';
      setError(message);
      showToast({ title: 'Gagal menyimpan guru', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <FormCard title="Memuat data guru"><p className="text-sm text-slate-500">Memuat data...</p></FormCard>;

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Data Master" title={title} description="Data guru mengikuti Sheet Guru dan dapat dikaitkan dengan user login." actions={<Link className="button button-secondary" to="/guru">Kembali</Link>} />
      {error ? <ErrorState description={error} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard title="Informasi Guru" description="Role guru dipakai untuk akses modul nilai, hafalan, dan wali kelas.">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === 'edit' ? <Field label="Guru ID" name="guruId" value={form.guruId} onChange={handleChange} required /> : null}
            <Field label="User ID" name="userId" value={form.userId} onChange={handleChange} placeholder="USR002" />
            <Field label="Nama Guru" name="namaGuru" value={form.namaGuru} onChange={handleChange} required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="No HP" name="noHp" value={form.noHp} onChange={handleChange} />
            <SelectField label="Role Guru" name="roleGuru" value={form.roleGuru} onChange={handleChange}>
              <option value="guru_mapel">Guru Mapel</option>
              <option value="guru_tahfidz">Guru Tahfidz</option>
              <option value="wali_kelas">Wali Kelas</option>
              <option value="kepala_sekolah">Kepala Sekolah</option>
            </SelectField>
            <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </SelectField>
          </div>
        </FormCard>
        <Actions isSaving={isSaving} />
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

function Actions({ isSaving }) {
  return <div className="flex justify-end gap-2"><Link className="button button-secondary" to="/guru">Batal</Link><button className="button button-primary gap-2" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? 'Menyimpan...' : 'Simpan'}</button></div>;
}
