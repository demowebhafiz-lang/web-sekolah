import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import FormModal from '../../components/ui/FormModal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { getStoredUser } from '../auth/authService.js';
import { ADMIN_ROLES, canAccess } from '../auth/roles.js';
import SiswaFormPage from './SiswaFormPage.jsx';
import { deleteSiswa, getSiswaList } from './siswaService.js';

const initialFilters = {
  kelasId: '',
  status: 'aktif',
  jenisKelamin: '',
  keyword: ''
};

export default function SiswaListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formModal, setFormModal] = useState(null);

  const canManage = canAccess(getStoredUser()?.role, ADMIN_ROLES);
  const total = useMemo(() => students.length, [students]);

  useEffect(() => {
    loadStudents(initialFilters);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToast({ title: 'Data siswa', description: location.state.message, variant: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  async function loadStudents(nextFilters = filters) {
    setIsLoading(true);
    setError('');

    try {
      const data = await getSiswaList({
        ...nextFilters,
        page: 1,
        limit: 100
      });
      const items = data.items || [];
      const filtered = nextFilters.jenisKelamin
        ? items.filter((item) => item.jenisKelamin === nextFilters.jenisKelamin)
        : items;
      setStudents(filtered);
    } catch (err) {
      setError(err.message || 'Gagal memuat data siswa.');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadStudents(filters);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteSiswa(deleteTarget.siswaId);
      showToast({ title: 'Siswa dinonaktifkan', description: `${deleteTarget.namaLengkap} berhasil dinonaktifkan.`, variant: 'success' });
      setDeleteTarget(null);
      await loadStudents(filters);
    } catch (err) {
      showToast({ title: 'Gagal menonaktifkan siswa', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleSaved(message) {
    setFormModal(null);
    showToast({ title: 'Data siswa', description: message, variant: 'success' });
    await loadStudents(filters);
  }

  const columns = [
    {
      key: 'foto',
      header: 'Foto',
      render: (student) => <AvatarImage className="h-10 w-10" name={student.namaLengkap} src={student.fotoUrl} />
    },
    { key: 'nis', header: 'NIS', render: (student) => student.nis || '-' },
    {
      key: 'namaLengkap',
      header: 'Nama',
      render: (student) => (
        <div>
          <button className="text-left font-semibold text-slate-950 hover:text-emerald-700" type="button" onClick={() => navigate(`/siswa/${student.siswaId}`, { state: { student } })}>
            {student.namaLengkap || '-'}
          </button>
          <p className="text-xs text-slate-500">{student.siswaId}</p>
        </div>
      )
    },
    { key: 'jenisKelamin', header: 'JK', render: (student) => student.jenisKelamin || '-' },
    { key: 'kelasId', header: 'Kelas', render: (student) => student.kelasId || '-' },
    { key: 'namaOrangTua', header: 'Orang Tua', render: (student) => student.namaOrangTua || '-' },
    { key: 'status', header: 'Status', render: (student) => <StatusBadge status={student.status || 'aktif'} /> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (student) => (
        <div className="flex flex-wrap gap-2">
          <button className="text-button" type="button" onClick={() => navigate(`/siswa/${student.siswaId}`, { state: { student } })}>Detail</button>
          {canManage ? (
            <>
              <button className="text-button" type="button" onClick={() => setFormModal({ mode: 'edit', item: student })}>Edit</button>
              <button className="text-button danger" type="button" onClick={() => setDeleteTarget(student)}>Nonaktifkan</button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Data Master"
        title="Data Siswa"
        description="Kelola data siswa, foto profil, status aktif, dan informasi orang tua."
        actions={canManage ? (
          <button className="button button-primary gap-2" type="button" onClick={() => setFormModal({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        ) : null}
      />

      <FilterBar onSubmit={handleSubmit} actionLabel={isLoading ? 'Memuat...' : 'Tampilkan'} className="xl:[&_>div>div]:grid-cols-4">
        <Field label="Cari nama/NIS">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Ahmad / 2026001" />
          </div>
        </Field>
        <Field label="Kelas">
          <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="kelasId" value={filters.kelasId} onChange={handleFilterChange} placeholder="KLS001" />
        </Field>
        <Field label="Status">
          <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Semua</option>
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="pindah">Pindah</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </Field>
        <Field label="Jenis Kelamin">
          <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="jenisKelamin" value={filters.jenisKelamin} onChange={handleFilterChange}>
            <option value="">Semua</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </Field>
      </FilterBar>

      {error ? <ErrorState description={error} onRetry={() => loadStudents(filters)} /> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Daftar Siswa</h2>
            <p className="text-sm text-slate-500">{total} data tampil</p>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={students}
          keyField="siswaId"
          loading={isLoading}
          emptyTitle="Belum ada data siswa"
          emptyDescription="Gunakan filter lain atau tambahkan siswa baru."
        />
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan siswa?"
        description={`Data ${deleteTarget?.namaLengkap || 'siswa'} tidak dihapus, hanya diubah menjadi nonaktif.`}
        confirmLabel="Nonaktifkan"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <FormModal
        open={Boolean(formModal)}
        title={formModal?.mode === 'edit' ? 'Edit Siswa' : 'Tambah Siswa'}
        description="Isi data siswa tanpa meninggalkan daftar."
        onClose={() => setFormModal(null)}
        size="xl"
      >
        <SiswaFormPage
          key={`${formModal?.mode || 'closed'}-${formModal?.item?.siswaId || 'new'}`}
          modalMode={formModal?.mode}
          initialStudent={formModal?.item}
          onCancel={() => setFormModal(null)}
          onSaved={handleSaved}
        />
      </FormModal>
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
