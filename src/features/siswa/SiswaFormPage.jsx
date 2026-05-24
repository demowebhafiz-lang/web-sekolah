import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { fileToBase64Payload, IMAGE_ACCEPT, IMAGE_MAX_BYTES, validateImageFile } from '../../utils/fileUpload.js';
import { getKelasList } from '../kelas/kelasService.js';
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
  namaAyah: '',
  namaIbu: '',
  namaWali: '',
  namaOrangTua: '',
  noHpOrangTua: '',
  alamat: '',
  fotoFileId: '',
  fotoUrl: '',
  status: 'aktif'
};

export default function SiswaFormPage({ modalMode, initialStudent, kelasRows: initialKelasRows, onCancel, onSaved }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = modalMode || (params.siswaId ? 'edit' : 'create');
  const initialData = initialStudent || location.state?.student;
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...initialData,
    siswaId: initialData?.siswaId || params.siswaId || ''
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.fotoUrl || '');
  const [kelasRows, setKelasRows] = useState(initialKelasRows || []);
  const [photoError, setPhotoError] = useState('');
  const [error, setError] = useState('');
  const [kelasError, setKelasError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.student);
  const [isLoadingKelas, setIsLoadingKelas] = useState(!(initialKelasRows || []).length);
  const [isSaving, setIsSaving] = useState(false);

  const title = useMemo(() => (mode === 'edit' ? 'Edit Siswa' : 'Tambah Siswa'), [mode]);

  useEffect(() => {
    if (initialStudent) {
      setForm({ ...emptyForm, ...initialStudent });
      setPhotoPreview(initialStudent.fotoUrl || '');
      setPhotoFile(null);
      return;
    }
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
  }, [initialStudent, location.state, mode, params.siswaId]);

  useEffect(() => {
    if (initialKelasRows?.length) {
      setKelasRows(initialKelasRows);
      setIsLoadingKelas(false);
      return;
    }

    setIsLoadingKelas(true);
    getKelasList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setKelasRows(data.items || []);
        setKelasError('');
      })
      .catch((err) => {
        setKelasRows([]);
        setKelasError(err.message || 'Gagal memuat data kelas.');
      })
      .finally(() => setIsLoadingKelas(false));
  }, [initialKelasRows]);

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
    if (!form.kelasId.trim()) return 'Kelas wajib dipilih.';
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

      const message = mode === 'edit' ? 'Siswa berhasil diperbarui.' : 'Siswa berhasil ditambahkan.';
      if (onSaved) onSaved(message);
      else navigate('/siswa', {
        replace: true,
        state: { message }
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
      {!onSaved ? <PageHeader
        eyebrow="Data Master"
        title={title}
        description="Isi data siswa sesuai struktur Sheet Siswa. Foto dikirim ke Google Drive lewat Apps Script."
        actions={<Link className="button button-secondary" to="/siswa">Kembali</Link>}
      /> : null}

      {error ? <ErrorState description={error} /> : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {kelasError ? <ErrorState description={kelasError} /> : null}

        <FormCard title="Identitas Siswa" description="Data dasar siswa untuk pencarian dan laporan.">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === 'edit' ? <Field label="Siswa ID" name="siswaId" value={form.siswaId} onChange={handleChange} required /> : null}
            <Field className="md:col-span-2" label="Nama Lengkap" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} required />
            <Field label="NIS" name="nis" value={form.nis} onChange={handleChange} required />
            <Field label="NISN" name="nisn" value={form.nisn} onChange={handleChange} />
            <SelectInput
              label="Jenis Kelamin"
              name="jenisKelamin"
              value={form.jenisKelamin}
              onChange={handleChange}
              required
              options={[
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' }
              ]}
            />
            <Field label="Tempat Lahir" name="tempatLahir" value={form.tempatLahir} onChange={handleChange} />
            <Field label="Tanggal Lahir" name="tanggalLahir" type="date" value={form.tanggalLahir} onChange={handleChange} />
          </div>
        </FormCard>

        <FormCard title="Akademik" description="Pilih kelas dari data kelas aktif.">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              label="Kelas"
              name="kelasId"
              value={form.kelasId}
              onChange={handleChange}
              required
              disabled={isLoadingKelas}
              placeholder={isLoadingKelas ? 'Memuat kelas...' : 'Pilih kelas'}
              helperText="Value yang disimpan adalah kelasId."
              options={kelasRows.map((kelas) => ({ value: kelas.kelasId, label: kelas.namaKelas || kelas.kelasId }))}
            />
            <SelectInput
              label="Status Siswa"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              options={[
                { value: 'aktif', label: 'Aktif' },
                { value: 'lulus', label: 'Lulus' },
                { value: 'pindah', label: 'Pindah' },
                { value: 'nonaktif', label: 'Nonaktif' }
              ]}
            />
          </div>
        </FormCard>

        <FormCard title="Orang Tua/Wali" description="Kontak keluarga untuk kebutuhan administrasi dan wali kelas.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Ayah" name="namaAyah" value={form.namaAyah} onChange={handleChange} />
            <Field label="Nama Ibu" name="namaIbu" value={form.namaIbu} onChange={handleChange} />
            <Field label="Nama Wali" name="namaWali" value={form.namaWali} onChange={handleChange} />
            <Field label="Nama Orang Tua/Wali Utama" name="namaOrangTua" value={form.namaOrangTua} onChange={handleChange} />
            <Field label="Nomor HP Wali" name="noHpOrangTua" value={form.noHpOrangTua} onChange={handleChange} />
          </div>
        </FormCard>

        <FormCard title="Alamat dan Foto" description="Foto disimpan ke Google Drive, bukan ke Sheet.">
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Alamat
              <textarea className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="alamat" value={form.alamat} onChange={handleChange} />
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <AvatarImage className="h-20 w-20 rounded-2xl text-xl" name={form.namaLengkap} src={photoPreview} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{photoFile?.name || 'Preview foto siswa'}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Maks. {IMAGE_MAX_BYTES / 1024 / 1024} MB.</p>
                </div>
              </div>
              {photoError ? <p className="mt-3 text-xs font-semibold text-rose-600">{photoError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="button button-secondary !inline-flex gap-2">
                  <ImageUp className="h-4 w-4" />
                  Pilih Foto
                  <input accept={IMAGE_ACCEPT} className="sr-only" type="file" onChange={handlePhotoChange} />
                </label>
                {mode === 'edit' && form.fotoUrl ? (
                  <button className="button border-rose-200 bg-white text-rose-700 hover:bg-rose-50" type="button" onClick={handleDeletePhoto}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </FormCard>

        <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:-mx-5 sm:px-5">
          {onCancel ? <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button> : <Link className="button button-secondary" to="/siswa">Batal</Link>}
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
