import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { deleteMapel, getMapelList } from './mapelService.js';

const initialFilters = {
  kelompok: '',
  status: 'aktif',
  keyword: ''
};

export default function MapelListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const total = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    loadRows(initialFilters);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToast({ title: 'Mata pelajaran', description: location.state.message, variant: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  async function loadRows(nextFilters = filters) {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMapelList({ ...nextFilters, page: 1, limit: 100 });
      const keyword = nextFilters.keyword.toLowerCase();
      let items = data.items || [];
      if (keyword) {
        items = items.filter((item) => String(item.namaMapel || '').toLowerCase().includes(keyword));
      }
      if (nextFilters.kelompok) {
        items = items.filter((item) => item.kelompok === nextFilters.kelompok);
      }
      setRows(items);
    } catch (err) {
      setRows([]);
      setError(err.message || 'Gagal memuat mata pelajaran.');
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
      await deleteMapel(deleteTarget.mapelId);
      showToast({ title: 'Mapel dinonaktifkan', description: `${deleteTarget.namaMapel} berhasil dinonaktifkan.`, variant: 'success' });
      setDeleteTarget(null);
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal menonaktifkan mapel', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  const columns = [
    { key: 'namaMapel', header: 'Mata Pelajaran', render: (row) => <strong className="text-slate-950">{row.namaMapel || '-'}</strong> },
    { key: 'kelompok', header: 'Kelompok', render: (row) => row.kelompok || '-' },
    { key: 'guruId', header: 'Guru ID', render: (row) => row.guruId || '-' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status || 'aktif'} /> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button className="text-button" type="button" onClick={() => navigate(`/mapel/${row.mapelId}/edit`, { state: { mapel: row } })}>Edit</button>
          <button className="text-button danger" type="button" onClick={() => setDeleteTarget(row)}>Nonaktifkan</button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Data Master"
        title="Mata Pelajaran"
        description="Kelola mata pelajaran, kelompok mapel, guru pengampu, dan status aktif."
        actions={<Link className="button button-primary gap-2" to="/mapel/tambah"><Plus className="h-4 w-4" />Tambah Mapel</Link>}
      />

      <FilterBar onSubmit={(event) => { event.preventDefault(); loadRows(filters); }}>
        <Field label="Cari mapel" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Matematika" />
        <SelectField label="Kelompok" name="kelompok" value={filters.kelompok} onChange={handleFilterChange}>
          <option value="">Semua</option>
          <option value="Umum">Umum</option>
          <option value="Agama">Agama</option>
          <option value="Tahfidz">Tahfidz</option>
          <option value="Muatan Lokal">Muatan Lokal</option>
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
          <h2 className="text-base font-semibold text-slate-950">Daftar Mata Pelajaran</h2>
          <p className="text-sm text-slate-500">{total} data tampil</p>
        </div>
        <DataTable columns={columns} rows={rows} keyField="mapelId" loading={isLoading} emptyTitle="Belum ada mata pelajaran" />
      </section>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Nonaktifkan mapel?" description={`${deleteTarget?.namaMapel || 'Mapel'} akan diubah menjadi nonaktif.`} confirmLabel="Nonaktifkan" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </section>
  );
}

function Field({ label, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props} /></label>;
}

function SelectField({ label, children, ...props }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<select className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" {...props}>{children}</select></label>;
}
