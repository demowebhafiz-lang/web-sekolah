import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { getGuruList } from '../guru/guruService.js';
import { createMapel, getMapelList, updateMapel } from './mapelService.js';

const emptyForm = {
  mapelId: '',
  namaMapel: '',
  kelompok: 'Umum',
  guruId: '',
  status: 'aktif'
};

export default function MapelFormPage({ modalMode, initialMapel, onCancel, onSaved }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = modalMode || (params.mapelId ? 'edit' : 'create');
  const initialData = initialMapel || location.state?.mapel;
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initialData, mapelId: initialData?.mapelId || params.mapelId || '' }));
  const [guruRows, setGuruRows] = useState([]);
  const [error, setError] = useState('');
  const [guruError, setGuruError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.mapel);
  const [isLoadingGuru, setIsLoadingGuru] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const title = useMemo(() => (mode === 'edit' ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'), [mode]);

  useEffect(() => {
    if (initialMapel) {
      setForm({ ...emptyForm, ...initialMapel });
      return;
    }
    if (mode !== 'edit' || location.state?.mapel) return;
    getMapelList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const mapel = (data.items || []).find((item) => String(item.mapelId) === String(params.mapelId));
        if (mapel) setForm({ ...emptyForm, ...mapel });
        else setError('Data mata pelajaran tidak ditemukan.');
      })
      .catch((err) => setError(err.message || 'Gagal memuat mata pelajaran.'))
      .finally(() => setIsLoading(false));
  }, [initialMapel, location.state, mode, params.mapelId]);

  useEffect(() => {
    setIsLoadingGuru(true);
    getGuruList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setGuruRows(data.items || []);
        setGuruError('');
      })
      .catch((err) => {
        setGuruRows([]);
        setGuruError(err.message || 'Gagal memuat data guru.');
      })
      .finally(() => setIsLoadingGuru(false));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    if (!form.namaMapel.trim()) return 'Nama mata pelajaran wajib diisi.';
    if (!form.kelompok.trim()) return 'Kelompok wajib dipilih.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      showToast({ title: 'Periksa data mapel', description: validation, variant: 'error' });
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (mode === 'edit') await updateMapel(form);
      else await createMapel(form);
      const message = mode === 'edit' ? 'Mata pelajaran berhasil diperbarui.' : 'Mata pelajaran berhasil ditambahkan.';
      if (onSaved) onSaved(message);
      else navigate('/mapel', { replace: true, state: { message } });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan mata pelajaran.';
      setError(message);
      showToast({ title: 'Gagal menyimpan mapel', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <FormCard title="Memuat data mapel"><p className="text-sm text-slate-500">Memuat data...</p></FormCard>;

  return (
    <section className="space-y-6">
      {!onSaved ? <PageHeader eyebrow="Data Master" title={title} description="Mapel digunakan pada input dan rekap nilai akademik." actions={<Link className="button button-secondary" to="/mapel">Kembali</Link>} /> : null}
      {error ? <ErrorState description={error} /> : null}
      {guruError ? <ErrorState description={guruError} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard title="Informasi Mata Pelajaran" description="Kelompok membantu pemisahan mapel umum, agama, dan tahfidz.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Mapel" name="namaMapel" value={form.namaMapel} onChange={handleChange} required />
            <SelectInput
              label="Kategori"
              name="kelompok"
              value={form.kelompok}
              onChange={handleChange}
              options={[
                { value: 'Umum', label: 'Umum' },
                { value: 'Agama', label: 'Agama' },
                { value: 'Tahfidz', label: 'Tahfidz' },
                { value: 'Muatan Lokal', label: 'Muatan Lokal' }
              ]}
            />
            <SelectInput
              label="Guru Pengampu"
              name="guruId"
              value={form.guruId}
              onChange={handleChange}
              disabled={isLoadingGuru}
              placeholder={isLoadingGuru ? 'Memuat guru...' : 'Pilih guru pengampu'}
              options={guruRows.map((guru) => ({ value: guru.guruId, label: guru.namaGuru || guru.email || 'Tanpa nama guru' }))}
            />
            <SelectInput
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'aktif', label: 'Aktif' },
                { value: 'nonaktif', label: 'Nonaktif' }
              ]}
            />
          </div>
        </FormCard>
        <Actions isSaving={isSaving} onCancel={onCancel} />
      </form>
    </section>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function Actions({ isSaving, onCancel }) {
  return <div className="flex justify-end gap-2">{onCancel ? <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button> : <Link className="button button-secondary" to="/mapel">Batal</Link>}<button className="button button-primary gap-2" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? 'Menyimpan...' : 'Simpan'}</button></div>;
}
