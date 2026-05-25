import { useEffect, useMemo, useState } from 'react';
import { Building2, ImageUp, Loader2, MapPin, Save, UploadCloud } from 'lucide-react';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { fileToBase64Payload, IMAGE_ACCEPT, validateImageFile } from '../../utils/fileUpload.js';
import { getAppSettings, updateAppSettings, uploadSchoolLogo } from './settingsService.js';

const LOGO_MAX_BYTES = 1024 * 1024;

const initialForm = {
  schoolName: '',
  schoolAddress: ''
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileHelp = useMemo(() => 'JPG, JPEG, PNG, atau WEBP. Maksimal 1 MB.', []);
  const activeLogoUrl = preview || settings.schoolLogoUrl || settings.logoUrl || '';

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function loadSettings() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getAppSettings();
      setSettings(data);
      setForm({
        schoolName: data.schoolName || '',
        schoolAddress: data.schoolAddress || ''
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat pengaturan sekolah.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0];
    const validation = validateImageFile(nextFile, LOGO_MAX_BYTES);

    if (preview) URL.revokeObjectURL(preview);
    setLogoError(validation);
    setFile(validation ? null : nextFile);
    setPreview(validation || !nextFile ? '' : URL.createObjectURL(nextFile));
  }

  async function handleSaveSettings(event) {
    event.preventDefault();

    if (!form.schoolName.trim()) {
      setError('Nama sekolah wajib diisi.');
      return;
    }

    if (!form.schoolAddress.trim()) {
      setError('Alamat sekolah wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const nextSettings = await updateAppSettings(form);
      setSettings(nextSettings);
      setForm({
        schoolName: nextSettings.schoolName || '',
        schoolAddress: nextSettings.schoolAddress || ''
      });
      showToast({ title: 'Pengaturan tersimpan', description: 'Nama dan alamat sekolah sudah diperbarui.', variant: 'success' });
    } catch (err) {
      const message = err.message || 'Gagal menyimpan pengaturan sekolah.';
      setError(message);
      showToast({ title: 'Simpan gagal', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUploadLogo() {
    const validation = validateImageFile(file, LOGO_MAX_BYTES);
    if (validation) {
      setLogoError(validation);
      return;
    }

    setIsUploading(true);
    setLogoError('');

    try {
      const payload = await fileToBase64Payload(file);
      const nextSettings = await uploadSchoolLogo(payload);
      setSettings(nextSettings);
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview('');
      showToast({ title: 'Logo sekolah tersimpan', description: 'Logo akan tampil di login, navigasi, dan laporan.', variant: 'success' });
    } catch (err) {
      const message = err.message || 'Gagal upload logo sekolah.';
      setLogoError(message);
      showToast({ title: 'Upload gagal', description: message, variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader eyebrow="Pengaturan" title="Identitas Sekolah" description="Memuat pengaturan sekolah dari Apps Script." />
        <LoadingState label="Memuat pengaturan sekolah..." />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan"
        title="Identitas Sekolah"
        description="Kelola nama, alamat, dan logo sekolah yang tampil di login, navigasi, dan laporan cetak."
      />

      {error ? <ErrorState description={error} onRetry={loadSettings} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Preview Identitas</p>
          <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
            {activeLogoUrl ? (
              <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                <img alt="Preview logo sekolah" className="h-full w-full object-contain p-2" src={activeLogoUrl} />
              </span>
            ) : (
              <SchoolLogo className="h-24 w-24 rounded-2xl" fallbackClassName="bg-emerald-100 text-emerald-700" />
            )}
          </div>
          <div className="mt-6 space-y-2 text-center">
            <h2 className="text-lg font-bold text-slate-950">{form.schoolName || 'Nama sekolah belum diatur'}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{form.schoolAddress || 'Alamat sekolah belum diatur'}</p>
          </div>
        </section>

        <div className="space-y-6">
          <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSaveSettings}>
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-950">Data Sekolah</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">Nama dan alamat ini dipakai sebagai identitas resmi pada laporan cetak.</p>
            </div>

            <div className="grid gap-5">
              <Field label="Nama Sekolah" icon={Building2}>
                <input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="Nama sekolah" />
              </Field>
              <Field label="Alamat Sekolah" icon={MapPin}>
                <textarea className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="schoolAddress" value={form.schoolAddress} onChange={handleChange} placeholder="Alamat lengkap sekolah" />
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="button button-primary gap-2" type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-950">Logo Sekolah</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">Logo dipakai di login, navigasi aplikasi, dan header laporan cetak.</p>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Upload logo sekolah
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ImageUp className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{file?.name || 'Pilih file logo'}</p>
                    <p className="text-xs text-slate-500">{fileHelp}</p>
                  </div>
                </div>
                <input accept={IMAGE_ACCEPT} className="text-sm" type="file" onChange={handleFileChange} />
              </div>
            </label>

            {logoError ? <p className="form-error mt-4">{logoError}</p> : null}

            <div className="mt-5 flex justify-end">
              <button className="button button-secondary gap-2" type="button" onClick={handleUploadLogo} disabled={isUploading || !file}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {isUploading ? 'Mengupload...' : 'Upload Logo'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
