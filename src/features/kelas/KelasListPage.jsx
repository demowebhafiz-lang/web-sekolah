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
import { getGuruList } from '../guru/guruService.js';
import KelasFormPage from './KelasFormPage.jsx';
import { deleteKelas, getKelasList } from './kelasService.js';

const initialFilters = {
  tahunAjaran: '2026/2027',
  status: 'aktif',
  keyword: ''
};

export default function KelasListPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [guruRows, setGuruRows] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const total = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    loadRows(initialFilters);
    loadGuruRows();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToast({ title: 'Data kelas', description: location.state.message, variant: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  async function loadRows(nextFilters = filters) {
    setIsLoading(true);
    setError('');
    try {
      const data = await getKelasList({ ...nextFilters, page: 1, limit: 100 });
      const items = data.items || [];
      const filtered = nextFilters.keyword
        ? items.filter((item) => String(item.namaKelas || '').toLowerCase().includes(nextFilters.keyword.toLowerCase()))
        : items;
      setRows(filtered);
    } catch (err) {
      setRows([]);
      setError(err.message || 'Gagal memuat data kelas.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadGuruRows() {
    try {
      const data = await getGuruList({ status: 'aktif', page: 1, limit: 200 });
      setGuruRows(data.items || []);
    } catch {
      setGuruRows([]);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteKelas(deleteTarget.kelasId);
      showToast({ title: 'Kelas dinonaktifkan', description: `${deleteTarget.namaKelas} berhasil dinonaktifkan.`, variant: 'success' });
      setDeleteTarget(null);
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal menonaktifkan kelas', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleSaved(message) {
    setFormModal(null);
    showToast({ title: 'Data kelas', description: message, variant: 'success' });
    await loadRows(filters);
  }

  const columns = [
    { key: 'namaKelas', header: 'Kelas', render: (row) => <strong className="text-slate-950">{row.namaKelas || '-'}</strong> },
    { key: 'tingkat', header: 'Tingkat', render: (row) => row.tingkat || '-' },
    { key: 'waliKelasId', header: 'Wali Kelas', render: (row) => getGuruName(guruRows, row.waliKelasId) },
    { key: 'tahunAjaran', header: 'Tahun Ajaran', render: (row) => row.tahunAjaran || '-' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status || 'aktif'} /> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button className="text-button" type="button" onClick={() => setFormModal({ mode: 'edit', item: row })}>Edit</button>
          <button className="text-button danger" type="button" onClick={() => setDeleteTarget(row)}>Nonaktifkan</button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Data Master"
        title="Data Kelas"
        description="Kelola kelas, tingkat, wali kelas, tahun ajaran, dan status kelas."
        actions={<button className="button button-primary gap-2" type="button" onClick={() => setFormModal({ mode: 'create' })}><Plus className="h-4 w-4" />Tambah Kelas</button>}
      />

      <FilterBar onSubmit={(event) => { event.preventDefault(); loadRows(filters); }}>
        <Field label="Cari kelas" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="1A" />
        <Field label="Tahun Ajaran" name="tahunAjaran" value={filters.tahunAjaran} onChange={handleFilterChange} placeholder="2026/2027" />
        <SelectField label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </SelectField>
      </FilterBar>

      {error ? <ErrorState description={error} onRetry={() => loadRows(filters)} /> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-950">Daftar Kelas</h2>
          <p className="text-sm text-slate-500">{total} data tampil</p>
        </div>
        <DataTable columns={columns} rows={rows} keyField="kelasId" loading={isLoading} emptyTitle="Belum ada data kelas" />
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan kelas?"
        description={`Kelas ${deleteTarget?.namaKelas || ''} akan diubah menjadi nonaktif.`}
        confirmLabel="Nonaktifkan"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <FormModal
        open={Boolean(formModal)}
        title={formModal?.mode === 'edit' ? 'Edit Kelas' : 'Tambah Kelas'}
        description="Isi data kelas tanpa meninggalkan daftar."
        onClose={() => setFormModal(null)}
      >
        <KelasFormPage
          key={`${formModal?.mode || 'closed'}-${formModal?.item?.kelasId || 'new'}`}
          modalMode={formModal?.mode}
          initialKelas={formModal?.item}
          onCancel={() => setFormModal(null)}
          onSaved={handleSaved}
        />
      </FormModal>
    </section>
  );
}

function getGuruName(guruRows, guruId) {
  return guruRows.find((guru) => String(guru.guruId) === String(guruId))?.namaGuru || '-';
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function SelectField({ label, children, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props}>{children}</select></label>;
}
