import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import FormModal from '../../components/ui/FormModal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import GuruFormPage from './GuruFormPage.jsx';
import { deleteGuru, getGuruList, updateGuru } from './guruService.js';

const initialFilters = {
  roleGuru: '',
  status: '',
  keyword: ''
};

export default function GuruListPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const total = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    loadRows(initialFilters);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToast({ title: 'Data guru', description: location.state.message, variant: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  async function loadRows(nextFilters = filters) {
    setIsLoading(true);
    setError('');
    try {
      const data = await getGuruList({ ...nextFilters, page: 1, limit: 100 });
      const keyword = nextFilters.keyword.toLowerCase();
      let items = data.items || [];
      if (keyword) {
        items = items.filter((item) =>
          String(item.namaGuru || '').toLowerCase().includes(keyword) ||
          String(item.email || '').toLowerCase().includes(keyword)
        );
      }
      if (nextFilters.roleGuru) {
        items = items.filter((item) => item.roleGuru === nextFilters.roleGuru);
      }
      setRows(items);
    } catch (err) {
      setRows([]);
      setError(err.message || 'Gagal memuat data guru.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGuru(deleteTarget.guruId);
      showToast({ title: 'Guru dinonaktifkan', description: `${deleteTarget.namaGuru} berhasil dinonaktifkan.`, variant: 'success' });
      setDeleteTarget(null);
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal menonaktifkan guru', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleRestore(guru) {
    try {
      await updateGuru({ guruId: guru.guruId, status: 'aktif' });
      showToast({ title: 'Guru diaktifkan', description: `${guru.namaGuru} berhasil diaktifkan kembali.`, variant: 'success' });
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal mengaktifkan guru', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleSaved(message) {
    setFormModal(null);
    showToast({ title: 'Data guru', description: message, variant: 'success' });
    await loadRows(filters);
  }

  const columns = [
    { key: 'namaGuru', header: 'Nama Guru', render: (row) => <strong className={row.status === 'nonaktif' ? 'text-slate-400 line-through' : 'text-slate-950'}>{row.namaGuru || '-'}</strong> },
    { key: 'email', header: 'Email', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400' : ''}>{row.email || '-'}</span> },
    { key: 'noHp', header: 'No HP', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400' : ''}>{row.noHp || '-'}</span> },
    { key: 'roleGuru', header: 'Role', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400 capitalize' : 'capitalize'}>{String(row.roleGuru || '-').replaceAll('_', ' ')}</span> },
    { key: 'akun', header: 'Akun', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400' : ''}>{row.userId ? '✓ Aktif' : '✗ Belum dibuat'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status || 'aktif'} /> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'nonaktif' ? (
            <button className="text-button" type="button" onClick={() => handleRestore(row)}>Aktifkan</button>
          ) : (
            <>
              <button className="text-button" type="button" onClick={() => setFormModal({ mode: 'edit', item: row })}>Edit</button>
              <button className="text-button danger" type="button" onClick={() => setDeleteTarget(row)}>Nonaktifkan</button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Data Master"
        title="Data Guru"
        description="Kelola guru, akun terkait, role pengajar, dan status aktif."
        actions={<button className="button button-primary gap-2" type="button" onClick={() => setFormModal({ mode: 'create' })}><Plus className="h-4 w-4" />Tambah Guru</button>}
      />

      <FilterBar onSubmit={(event) => { event.preventDefault(); loadRows(filters); }}>
        <Field label="Cari nama/email" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Ustadz Ahmad" />
        <SelectField label="Role Guru" name="roleGuru" value={filters.roleGuru} onChange={handleFilterChange}>
          <option value="">Semua</option>
          <option value="guru_mapel">Guru Mapel</option>
          <option value="guru_tahfidz">Guru Tahfidz</option>
          <option value="wali_kelas">Wali Kelas</option>
          <option value="kepala_sekolah">Kepala Sekolah</option>
        </SelectField>
        <SelectField label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </SelectField>
      </FilterBar>

      {error ? <ErrorState description={error} onRetry={() => loadRows(filters)} /> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-950">Daftar Guru</h2>
          <p className="text-sm text-slate-500">{total} data tampil</p>
        </div>
        <DataTable columns={columns} rows={rows} keyField="guruId" loading={isLoading} emptyTitle="Belum ada data guru" />
      </section>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Nonaktifkan guru?" description={`Guru ${deleteTarget?.namaGuru || ''} akan dinonaktifkan (tidak dihapus permanen). Data terkait tetap tersimpan. Anda bisa mengaktifkan kembali dari filter "Nonaktif".`} confirmLabel="Nonaktifkan" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      <FormModal
        open={Boolean(formModal)}
        title={formModal?.mode === 'edit' ? 'Edit Guru' : 'Tambah Guru'}
        description="Isi data guru tanpa meninggalkan daftar."
        onClose={() => setFormModal(null)}
      >
        <GuruFormPage
          key={`${formModal?.mode || 'closed'}-${formModal?.item?.guruId || 'new'}`}
          modalMode={formModal?.mode}
          initialGuru={formModal?.item}
          onCancel={() => setFormModal(null)}
          onSaved={handleSaved}
        />
      </FormModal>
    </section>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function SelectField({ label, children, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props}>{children}</select></label>;
}
