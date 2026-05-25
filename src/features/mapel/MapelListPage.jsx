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
import MapelFormPage from './MapelFormPage.jsx';
import { deleteMapel, getMapelList, updateMapel } from './mapelService.js';

const initialFilters = {
  kelompok: '',
  status: '',
  keyword: ''
};

export default function MapelListPage() {
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
      await deleteMapel(deleteTarget.mapelId);
      showToast({ title: 'Mapel dinonaktifkan', description: `${deleteTarget.namaMapel} berhasil dinonaktifkan.`, variant: 'success' });
      setDeleteTarget(null);
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal menonaktifkan mapel', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleRestore(mapel) {
    try {
      await updateMapel({ mapelId: mapel.mapelId, status: 'aktif' });
      showToast({ title: 'Mapel diaktifkan', description: `${mapel.namaMapel} berhasil diaktifkan kembali.`, variant: 'success' });
      await loadRows(filters);
    } catch (err) {
      showToast({ title: 'Gagal mengaktifkan mapel', description: err.message || 'Request gagal.', variant: 'error' });
    }
  }

  async function handleSaved(message) {
    setFormModal(null);
    showToast({ title: 'Mata pelajaran', description: message, variant: 'success' });
    await loadRows(filters);
  }

  const columns = [
    { key: 'namaMapel', header: 'Mata Pelajaran', render: (row) => <strong className={row.status === 'nonaktif' ? 'text-slate-400 line-through' : 'text-slate-950'}>{row.namaMapel || '-'}</strong> },
    { key: 'guruId', header: 'Guru Pengampu', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400' : ''}>{getGuruName(guruRows, row.guruId)}</span> },
    { key: 'kelompok', header: 'Kategori', render: (row) => <span className={row.status === 'nonaktif' ? 'text-slate-400' : ''}>{row.kelompok || '-'}</span> },
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
        title="Mata Pelajaran"
        description="Kelola mata pelajaran, kelompok mapel, guru pengampu, dan status aktif."
        actions={<button className="button button-primary gap-2" type="button" onClick={() => setFormModal({ mode: 'create' })}><Plus className="h-4 w-4" />Tambah Mapel</button>}
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

      <ConfirmDialog open={Boolean(deleteTarget)} title="Nonaktifkan mapel?" description={`${deleteTarget?.namaMapel || 'Mapel'} akan dinonaktifkan (tidak dihapus permanen). Data terkait tetap tersimpan. Anda bisa mengaktifkan kembali dari filter "Nonaktif".`} confirmLabel="Nonaktifkan" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      <FormModal
        open={Boolean(formModal)}
        title={formModal?.mode === 'edit' ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
        description="Isi mata pelajaran tanpa meninggalkan daftar."
        onClose={() => setFormModal(null)}
      >
        <MapelFormPage
          key={`${formModal?.mode || 'closed'}-${formModal?.item?.mapelId || 'new'}`}
          modalMode={formModal?.mode}
          initialMapel={formModal?.item}
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
