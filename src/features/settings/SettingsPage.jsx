import { useEffect, useMemo, useState } from 'react';
import { ImageUp, Loader2, UploadCloud } from 'lucide-react';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { fileToBase64Payload, IMAGE_ACCEPT, IMAGE_MAX_BYTES, validateImageFile } from '../../utils/fileUpload.js';
import { getPublicSettings, uploadSchoolLogo } from './settingsService.js';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fileHelp = useMemo(() => `JPG, JPEG, PNG, atau WEBP. Maksimal ${IMAGE_MAX_BYTES / 1024 / 1024} MB.`, []);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch((err) => setError(err.message || 'Gagal memuat pengaturan sekolah.'))
      .finally(() => setIsLoading(false));
  }, []);

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0];
    const validation = validateImageFile(nextFile);

    setError(validation);
    setFile(validation ? null : nextFile);
    setPreview(validation || !nextFile ? '' : URL.createObjectURL(nextFile));
  }

  async function handleUpload(event) {
    event.preventDefault();

    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const payload = await fileToBase64Payload(file);
      const nextSettings = await uploadSchoolLogo(payload);
      setSettings(nextSettings);
      setFile(null);
      setPreview('');
      showToast({ title: 'Logo sekolah tersimpan', description: 'Logo akan tampil di login, navigasi, dan laporan.', variant: 'success' });
    } catch (err) {
      const message = err.message || 'Gagal upload logo sekolah.';
      setError(message);
      showToast({ title: 'Upload gagal', description: message, variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan"
        title="Identitas Sekolah"
        description="Upload logo sekolah ke Google Drive. Sheet Settings hanya menyimpan fileId dan URL logo."
      />

      <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleUpload}>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">Logo aktif</p>
            <div className="mt-5 grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              ) : preview ? (
                <img alt="Preview logo sekolah" className="h-28 w-28 object-contain" src={preview} />
              ) : settings.logoUrl ? (
                <img alt="Logo sekolah aktif" className="h-28 w-28 object-contain" src={settings.logoUrl} />
              ) : (
                <SchoolLogo className="h-24 w-24 rounded-2xl" fallbackClassName="bg-emerald-100 text-emerald-700" />
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Logo dipakai di Login Page, Sidebar, Topbar, dan halaman Laporan/Cetak.</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Gambar dikirim sebagai base64 hanya saat upload ke Apps Script, lalu disimpan sebagai file Google Drive. Base64 tidak disimpan ke Google Sheets.
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

            {error ? <p className="form-error">{error}</p> : null}

            <div className="flex justify-end">
              <button className="button button-primary gap-2" type="submit" disabled={isUploading || !file}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {isUploading ? 'Mengupload...' : 'Simpan Logo'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
