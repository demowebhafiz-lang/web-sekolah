import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { fileToBase64Payload, IMAGE_ACCEPT, IMAGE_MAX_BYTES, validateImageFile } from '../../utils/fileUpload.js';
import { createSiswa, deleteSiswaPhoto, getSiswaList, updateSiswa, uploadSiswaPhoto } from './siswaService.js';

const emptyForm = {
  siswaId: '',
  nis: '',
  nisn: '',
  namaLengkap: '',
  jenisKelamin: 'L',
  tempatLahir: '',
  tanggalLahir: '',
  kelasId: '',
  namaOrangTua: '',
  noHpOrangTua: '',
  alamat: '',
  fotoFileId: '',
  fotoUrl: '',
  status: 'aktif'
};

export default function SiswaFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = params.siswaId ? 'edit' : 'create';
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...location.state?.student,
    siswaId: location.state?.student?.siswaId || params.siswaId || ''
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(location.state?.student?.fotoUrl || '');
  const [photoError, setPhotoError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.student);
  const [isSaving, setIsSaving] = useState(false);

  const title = useMemo(() => (mode === 'edit' ? 'Edit Siswa' : 'Tambah Siswa'), [mode]);

  useEffect(() => {
    if (mode !== 'edit' || location.state?.student) return;

    getSiswaList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const student = (data.items || []).find((item) => String(item.siswaId) === String(params.siswaId));
        if (!student) {
          setError('Data siswa tidak ditemukan.');
          return;
        }
        setForm({ ...emptyForm, ...student });
        setPhotoPreview(student.fotoUrl || '');
      })
      .catch((err) => setError(err.message || 'Gagal memuat data siswa.'))
      .finally(() => setIsLoading(false));
  }, [location.state, mode, params.siswaId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    const validation = validateImageFile(file);

    setPhotoError(validation);
    setPhotoFile(validation ? null : file);
    setPhotoPreview(validation || !file ? form.fotoUrl : URL.createObjectURL(file));
  }

  async function handleDeletePhoto() {
    if (!form.siswaId) return;

    try {
      await deleteSiswaPhoto(form.siswaId);
      setForm((current) => ({ ...current, fotoFileId: '', fotoUrl: '' }));
      setPhotoFile(null);
      setPhotoPreview('');
      showToast({ title: 'Foto siswa dihapus', description: 'Avatar inisial akan digunakan sebagai fallback.', variant: 'success' });
    } catch (err) {
      showToast({ title: 'Gagal menghapus foto', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  function validate() {
    if (!form.nis.trim()) return 'NIS wajib diisi.';
    if (!form.namaLengkap.trim()) return 'Nama lengkap wajib diisi.';
    if (!form.kelasId.trim()) return 'Kelas ID wajib diisi.';
    if (!['L', 'P'].includes(form.jenisKelamin)) return 'Jenis kelamin harus L atau P.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate() || photoError;

    if (validation) {
      setError(validation);
      showToast({ title: 'Periksa data siswa', description: validation, variant: 'error' });
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const result = mode === 'edit' ? await updateSiswa(form) : await createSiswa(form);
      const siswaId = form.siswaId || result?.siswaId || result?.item?.siswaId;

      if (photoFile && siswaId) {
        const photoPayload = await fileToBase64Payload(photoFile);
        await uploadSiswaPhoto({ ...photoPayload, siswaId });
      }

      navigate('/siswa', {
        replace: true,
        state: { message: mode === 'edit' ? 'Siswa berhasil diperbarui.' : 'Siswa berhasil ditambahkan.' }
      });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan siswa.';
      setError(message);
      showToast({ title: 'Gagal menyimpan siswa', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <FormCard title="Memuat data siswa"><div className="text-sm text-slate-500">Memuat data...</div></FormCard>;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Data Master"
        title={title}
        description="Isi data siswa sesuai struktur Sheet Siswa. Foto dikirim ke Google Drive lewat Apps Script."
        actions={<Link className="button button-secondary" to="/siswa">Kembali</Link>}
      />

      {error ? <ErrorState description={error} /> : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard title="Foto Siswa" description="Gunakan JPG, PNG, atau WEBP. Maksimal 2 MB.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarImage className="h-24 w-24 rounded-2xl text-2xl" name={form.namaLengkap} src={photoPreview} />
              <div>
                <p className="text-sm font-semibold text-slate-950">{photoFile?.name || 'Preview foto siswa'}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Batas ukuran {IMAGE_MAX_BYTES / 1024 / 1024} MB. Base64 hanya dipakai saat upload dan tidak disimpan di Sheets.
                </p>
                {photoError ? <p className="mt-2 text-xs font-semibold text-rose-600">{photoError}</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="button button-secondary !inline-flex gap-2">
                <ImageUp className="h-4 w-4" />
                Pilih Foto
                <input accept={IMAGE_ACCEPT} className="sr-only" type="file" onChange={handlePhotoChange} />
              </label>
              {mode === 'edit' && form.fotoUrl ? (
                <button className="button border-rose-200 bg-white text-rose-700 hover:bg-rose-50" type="button" onClick={handleDeletePhoto}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Foto
                </button>
              ) : null}
            </div>
          </div>
        </FormCard>

        <FormCard title="Data Utama" description="Identitas dasar siswa dan kelas aktif.">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === 'edit' ? <Field label="Siswa ID" name="siswaId" value={form.siswaId} onChange={handleChange} required /> : null}
            <Field label="NIS" name="nis" value={form.nis} onChange={handleChange} required />
            <Field label="NISN" name="nisn" value={form.nisn} onChange={handleChange} />
            <Field className="md:col-span-2" label="Nama Lengkap" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} required />
            <SelectField label="Jenis Kelamin" name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </SelectField>
            <Field label="Kelas ID" name="kelasId" value={form.kelasId} onChange={handleChange} placeholder="KLS001" required />
            <Field label="Tempat Lahir" name="tempatLahir" value={form.tempatLahir} onChange={handleChange} />
            <Field label="Tanggal Lahir" name="tanggalLahir" type="date" value={form.tanggalLahir} onChange={handleChange} />
          </div>
        </FormCard>

        <FormCard title="Data Orang Tua" description="Kontak dan alamat untuk kebutuhan wali kelas.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Orang Tua" name="namaOrangTua" value={form.namaOrangTua} onChange={handleChange} />
            <Field label="No HP Orang Tua" name="noHpOrangTua" value={form.noHpOrangTua} onChange={handleChange} />
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
              Alamat
              <textarea className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="alamat" value={form.alamat} onChange={handleChange} />
            </label>
            <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="pindah">Pindah</option>
              <option value="nonaktif">Nonaktif</option>
            </SelectField>
          </div>
        </FormCard>

        <div className="flex justify-end gap-2">
          <Link className="button button-secondary" to="/siswa">Batal</Link>
          <button className="button button-primary gap-2" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} />
    </label>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props}>
        {children}
      </select>
    </label>
  );
}
