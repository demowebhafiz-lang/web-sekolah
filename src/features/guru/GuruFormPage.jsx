import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormCard from '../../components/ui/FormCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { createGuru, createGuruLoginAccount, getGuruList, getGuruLoginInfo, resetGuruPassword, updateGuru } from './guruService.js';

const emptyForm = {
  guruId: '',
  userId: '',
  nip: '',
  namaGuru: '',
  email: '',
  noHp: '',
  jenisKelamin: 'L',
  jabatan: '',
  roleGuru: 'guru_mapel',
  status: 'aktif',
  createLoginAccount: false,
  loginAccount: {
    email: '',
    password: '',
    role: 'guru_mapel',
    status: 'aktif'
  }
};

export default function GuruFormPage({ modalMode, initialGuru, onCancel, onSaved }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showToast } = useToast();
  const mode = modalMode || (params.guruId ? 'edit' : 'create');
  const initialData = initialGuru || location.state?.guru;
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initialData, guruId: initialData?.guruId || params.guruId || '' }));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !location.state?.guru);
  const [isSaving, setIsSaving] = useState(false);
  const [loginInfo, setLoginInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateLogin, setShowCreateLogin] = useState(false);
  const title = useMemo(() => (mode === 'edit' ? 'Edit Guru' : 'Tambah Guru'), [mode]);

  useEffect(() => {
    if (initialGuru) {
      setForm({ ...emptyForm, ...initialGuru });
      if (mode === 'edit' && initialGuru.guruId) {
        loadLoginInfo(initialGuru.guruId);
      }
      return;
    }
    if (mode !== 'edit' || location.state?.guru) return;
    getGuruList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const guru = (data.items || []).find((item) => String(item.guruId) === String(params.guruId));
        if (guru) {
          setForm({ ...emptyForm, ...guru });
          loadLoginInfo(guru.guruId);
        } else {
          setError('Data guru tidak ditemukan.');
        }
      })
      .catch((err) => setError(err.message || 'Gagal memuat data guru.'))
      .finally(() => setIsLoading(false));
  }, [initialGuru, location.state, mode, params.guruId]);

  async function loadLoginInfo(guruId) {
    try {
      const data = await getGuruLoginInfo(guruId);
      setLoginInfo(data);
    } catch (err) {
      console.error('Gagal memuat info login:', err);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    if (name === 'createLoginAccount') {
      setForm((current) => ({
        ...current,
        createLoginAccount: checked,
        loginAccount: checked ? { ...current.loginAccount, email: current.email || '' } : current.loginAccount
      }));
    } else if (name.startsWith('loginAccount.')) {
      const field = name.split('.')[1];
      setForm((current) => ({
        ...current,
        loginAccount: { ...current.loginAccount, [field]: value }
      }));
    } else {
      setForm((current) => ({
        ...current,
        [name]: type === 'checkbox' ? checked : value,
        ...(name === 'email' && current.createLoginAccount ? { loginAccount: { ...current.loginAccount, email: value } } : {})
      }));
    }
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((current) => ({
      ...current,
      loginAccount: { ...current.loginAccount, password }
    }));
    setShowPassword(true);
  }

  function validate() {
    if (!form.namaGuru.trim()) return 'Nama guru wajib diisi.';
    if (!form.email.trim()) return 'Email wajib diisi.';
    if (!form.roleGuru.trim()) return 'Role guru wajib dipilih.';
    if (form.createLoginAccount) {
      if (!form.loginAccount.email.trim()) return 'Email login wajib diisi.';
      if (!form.loginAccount.password.trim()) return 'Password awal wajib diisi.';
      if (!form.loginAccount.role.trim()) return 'Role akun wajib dipilih.';
    }
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
      const message = mode === 'edit' ? 'Guru berhasil diperbarui.' : 'Guru berhasil ditambahkan.';
      if (onSaved) onSaved(message);
      else navigate('/guru', { replace: true, state: { message } });
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
      {!onSaved ? <PageHeader eyebrow="Data Master" title={title} description="Data guru mengikuti Sheet Guru dan dapat dikaitkan dengan user login." actions={<Link className="button button-secondary" to="/guru">Kembali</Link>} /> : null}
      {error ? <ErrorState description={error} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard title="Informasi Guru" description="Role guru dipakai untuk akses modul nilai, hafalan, dan wali kelas.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Guru" name="namaGuru" value={form.namaGuru} onChange={handleChange} required />
            <Field label="NIP/NUPTK" name="nip" value={form.nip} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="No HP" name="noHp" value={form.noHp} onChange={handleChange} />
            <SelectInput
              label="Jenis Kelamin"
              name="jenisKelamin"
              value={form.jenisKelamin}
              onChange={handleChange}
              options={[
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' }
              ]}
            />
            <Field label="Jabatan" name="jabatan" value={form.jabatan} onChange={handleChange} placeholder="Guru Kelas / Guru Mapel" />
            <SelectInput
              label="Role Guru"
              name="roleGuru"
              value={form.roleGuru}
              onChange={handleChange}
              options={[
                { value: 'guru_mapel', label: 'Guru Mapel' },
                { value: 'guru_tahfidz', label: 'Guru Tahfidz' },
                { value: 'wali_kelas', label: 'Wali Kelas' },
                { value: 'kepala_sekolah', label: 'Kepala Sekolah' }
              ]}
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

        {mode === 'create' && (
          <FormCard title="Akun Login" description="Buat akun login untuk guru agar dapat mengakses sistem.">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="createLoginAccount"
                  checked={form.createLoginAccount}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                Buat akun login untuk guru
              </label>

              {form.createLoginAccount && (
                <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                  <Field
                    label="Email Login"
                    name="loginAccount.email"
                    type="email"
                    value={form.loginAccount.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Password Awal</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="loginAccount.password"
                          value={form.loginAccount.password}
                          onChange={handleChange}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="button button-secondary gap-1 whitespace-nowrap"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Generate
                      </button>
                    </div>
                  </div>
                  <SelectInput
                    label="Role Akun"
                    name="loginAccount.role"
                    value={form.loginAccount.role}
                    onChange={handleChange}
                    options={[
                      { value: 'guru_mapel', label: 'Guru Mapel' },
                      { value: 'guru_tahfidz', label: 'Guru Tahfidz' },
                      { value: 'wali_kelas', label: 'Wali Kelas' }
                    ]}
                  />
                  <SelectInput
                    label="Status Akun"
                    name="loginAccount.status"
                    value={form.loginAccount.status}
                    onChange={handleChange}
                    options={[
                      { value: 'aktif', label: 'Aktif' },
                      { value: 'nonaktif', label: 'Nonaktif' }
                    ]}
                  />
                </div>
              )}
            </div>
          </FormCard>
        )}

        {mode === 'edit' && loginInfo && (
          <FormCard title="Akun Login" description="Informasi akun login guru.">
            {loginInfo.hasLoginAccount ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoField label="Email Login" value={loginInfo.loginInfo.email} />
                  <InfoField label="Role" value={loginInfo.loginInfo.role.replaceAll('_', ' ')} />
                  <InfoField label="Status" value={loginInfo.loginInfo.status} />
                  <InfoField label="Last Login" value={loginInfo.loginInfo.lastLoginAt || 'Belum pernah login'} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateLogin(true)}
                    className="button button-secondary text-sm"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Guru belum memiliki akun login.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateLogin(true)}
                  className="button button-primary text-sm"
                >
                  Buat Akun Login
                </button>
              </div>
            )}
          </FormCard>
        )}

        <Actions isSaving={isSaving} onCancel={onCancel} />
      </form>
    </section>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function InfoField({ label, value }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 capitalize">{value || '-'}</span>
    </div>
  );
}

function Actions({ isSaving, onCancel }) {
  return <div className="flex justify-end gap-2">{onCancel ? <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button> : <Link className="button button-secondary" to="/guru">Batal</Link>}<button className="button button-primary gap-2" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? 'Menyimpan...' : 'Simpan'}</button></div>;
}
