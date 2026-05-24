import { useEffect, useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, Printer, RotateCcw, TrendingUp } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getKelasList } from '../kelas/kelasService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { getRekapHafalan } from './hafalanService.js';

const initialFilters = {
  tahunAjaran: '2026/2027',
  kelasId: '',
  siswaId: '',
  juz: '',
  statusHafalan: ''
};

const statusOptions = [
  { value: '', label: 'Semua status' },
  { value: 'baru', label: 'Baru' },
  { value: 'lancar', label: 'Lancar' },
  { value: 'murajaah', label: 'Murajaah' },
  { value: 'perlu_perbaikan', label: 'Perlu Perbaikan' },
  { value: 'selesai', label: 'Selesai' }
];

const columns = [
  { key: 'no', header: 'No', render: (_row, index) => index + 1 },
  { key: 'namaLengkap', header: 'Nama siswa', render: (row) => row.namaLengkap || row.namaSiswa || row.siswaId || '-' },
  { key: 'namaKelas', header: 'Kelas', render: (row) => row.namaKelas || row.kelasId || '-' },
  { key: 'totalSetoran', header: 'Total setoran', render: (row) => row.totalSetoran || 0 },
  { key: 'juzTerakhir', header: 'Juz terakhir', render: (row) => row.juzTerakhir || '-' },
  { key: 'surahTerakhir', header: 'Surah terakhir', render: (row) => row.surahTerakhir || '-' },
  {
    key: 'statusTerakhir',
    header: 'Status terakhir',
    render: (row) => <StatusBadge status={row.statusTerakhir || row.statusHafalan || 'baru'} />
  },
  { key: 'rataRata', header: 'Rata-rata', render: (row) => formatNumber(row.rataRata || row.rata) }
];

export default function HafalanRekapPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [kelasRows, setKelasRows] = useState([]);
  const [siswaRows, setSiswaRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [masterError, setMasterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setIsLoadingMaster(true);
    getKelasList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setKelasRows(data.items || []);
        setMasterError('');
      })
      .catch((err) => setMasterError(err.message || 'Gagal memuat data kelas.'))
      .finally(() => setIsLoadingMaster(false));
  }, []);

  useEffect(() => {
    setFilters((current) => ({ ...current, siswaId: '' }));

    if (!filters.kelasId) {
      setSiswaRows([]);
      return;
    }

    setIsLoadingSiswa(true);
    getSiswaList({ kelasId: filters.kelasId, status: 'aktif', page: 1, limit: 200 })
      .then((data) => setSiswaRows(data.items || []))
      .catch((err) => {
        setSiswaRows([]);
        setError(err.message || 'Gagal memuat siswa pada kelas terpilih.');
      })
      .finally(() => setIsLoadingSiswa(false));
  }, [filters.kelasId]);

  const summary = useMemo(() => {
    const totalSetoran = rows.reduce((sum, row) => sum + Number(row.totalSetoran || 0), 0);
    const averages = rows.map((row) => Number(row.rataRata || row.rata)).filter((value) => !Number.isNaN(value));
    const lancar = rows.filter((row) => ['lancar', 'selesai'].includes(String(row.statusTerakhir || row.statusHafalan).toLowerCase())).length;
    const perluPerbaikan = rows.filter((row) => ['perlu_perbaikan', 'murajaah'].includes(String(row.statusTerakhir || row.statusHafalan).toLowerCase())).length;

    return {
      totalSetoran,
      rataRata: averages.length ? averages.reduce((sum, value) => sum + value, 0) / averages.length : 0,
      lancar,
      perluPerbaikan
    };
  }, [rows]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!filters.kelasId) {
      setError('Pilih kelas terlebih dahulu untuk menampilkan rekap hafalan.');
      setRows([]);
      setHasSearched(true);
      return;
    }

    setError('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await getRekapHafalan(filters);
      const normalizedRows = normalizeRekapRows(data.items || data.rows || [], {
        siswaRows,
        kelasRows,
        filters
      });
      setRows(normalizedRows);
    } catch (err) {
      setRows([]);
      setError(err.message || 'Gagal memuat rekap hafalan.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Hafalan Al-Qur'an"
        title="Rekap Hafalan"
        description="Pantau rekap hafalan per kelas, siswa, juz, dan status hafalan."
        actions={
          <button className="button button-secondary no-print" type="button" onClick={handlePrint} disabled={!rows.length}>
            <Printer className="h-4 w-4" />
            Cetak
          </button>
        }
      />

      {masterError ? <ErrorState description={masterError} /> : null}

      <div className="no-print">
        <FilterBar onSubmit={handleSubmit} actionLabel={isLoading ? 'Memuat...' : 'Tampilkan'} className="report-filter">
          <Field label="Tahun Ajaran">
            <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="tahunAjaran" value={filters.tahunAjaran} onChange={handleChange} placeholder="2026/2027" />
          </Field>
          <SelectInput label="Kelas" name="kelasId" value={filters.kelasId} onChange={handleChange} disabled={isLoadingMaster}>
            <option value="">{isLoadingMaster ? 'Memuat kelas...' : 'Pilih kelas'}</option>
            {kelasRows.map((kelas) => (
              <option key={kelas.kelasId} value={kelas.kelasId}>
                {kelas.namaKelas || kelas.kelasId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Siswa" name="siswaId" value={filters.siswaId} onChange={handleChange} disabled={!filters.kelasId || isLoadingSiswa}>
            <option value="">{!filters.kelasId ? 'Pilih kelas dulu' : 'Semua siswa'}</option>
            {siswaRows.map((siswa) => (
              <option key={siswa.siswaId} value={siswa.siswaId}>
                {siswa.namaLengkap || siswa.siswaId}
              </option>
            ))}
          </SelectInput>
          <Field label="Juz">
            <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" name="juz" type="number" min="1" max="30" value={filters.juz} onChange={handleChange} placeholder="Semua" />
          </Field>
          <SelectInput label="Status Hafalan" name="statusHafalan" value={filters.statusHafalan} onChange={handleChange}>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectInput>
        </FilterBar>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total setoran" value={summary.totalSetoran} description="Akumulasi hasil filter" icon={BookMarked} tone="emerald" />
        <StatCard title="Rata-rata hafalan" value={formatNumber(summary.rataRata)} description="Rata-rata hasil filter" icon={TrendingUp} tone="slate" />
        <StatCard title="Hafalan lancar" value={summary.lancar} description="Status lancar atau selesai" icon={CheckCircle2} tone="amber" />
        <StatCard title="Perlu murajaah" value={summary.perluPerbaikan} description="Status murajaah/perbaikan" icon={RotateCcw} tone="rose" />
      </div>

      <section className="print-area rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Tabel Rekap Hafalan</h2>
            <p className="text-sm text-slate-500">Kosongkan siswa untuk menampilkan seluruh siswa di kelas terpilih.</p>
          </div>
          <span className="text-sm font-medium text-slate-500">{rows.length} data</span>
        </div>

        {error ? (
          <ErrorState description={error} onRetry={() => handleSubmit({ preventDefault() {} })} />
        ) : !hasSearched ? (
          <EmptyState title="Tentukan filter rekap" description="Pilih kelas lalu klik Tampilkan untuk memuat rekap hafalan." />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            keyField="id"
            loading={isLoading}
            emptyTitle="Belum ada rekap hafalan"
            emptyDescription="Data akan tampil setelah backend mengembalikan hasil getRekapHafalan."
          />
        )}
      </section>
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

function normalizeRekapRows(items, { siswaRows, kelasRows, filters }) {
  const siswaMap = new Map(siswaRows.map((siswa) => [siswa.siswaId, siswa]));
  const kelasMap = new Map(kelasRows.map((kelas) => [kelas.kelasId, kelas]));
  const grouped = new Map();

  items.forEach((item, index) => {
    if (filters.juz && String(item.juz || item.juzTerakhir || '') !== String(filters.juz)) return;
    if (filters.statusHafalan && String(item.statusHafalan || item.statusTerakhir || '') !== filters.statusHafalan) return;

    const siswaId = item.siswaId || filters.siswaId || `siswa-${index}`;
    const student = siswaMap.get(siswaId) || {};
    const kelasId = item.kelasId || student.kelasId || filters.kelasId;
    const kelas = kelasMap.get(kelasId) || {};

    if (item.totalSetoran || item.juzTerakhir || item.surahTerakhir || item.statusTerakhir) {
      grouped.set(siswaId, {
        id: siswaId,
        siswaId,
        namaLengkap: item.namaLengkap || item.namaSiswa || student.namaLengkap || siswaId,
        kelasId,
        namaKelas: item.namaKelas || kelas.namaKelas || kelasId,
        totalSetoran: Number(item.totalSetoran || 0),
        juzTerakhir: item.juzTerakhir || item.juz || '-',
        surahTerakhir: item.surahTerakhir || item.surah || '-',
        statusTerakhir: item.statusTerakhir || item.statusHafalan || 'baru',
        rataRata: item.rataRata || item.rata || 0,
        tanggalTerakhir: item.tanggalTerakhir || item.tanggalSetor || item.tanggal
      });
      return;
    }

    const current = grouped.get(siswaId) || {
      id: siswaId,
      siswaId,
      namaLengkap: item.namaLengkap || item.namaSiswa || student.namaLengkap || siswaId,
      kelasId,
      namaKelas: item.namaKelas || kelas.namaKelas || kelasId,
      totalSetoran: 0,
      juzTerakhir: '-',
      surahTerakhir: '-',
      statusTerakhir: 'baru',
      rataValues: [],
      tanggalTerakhir: ''
    };

    current.totalSetoran += 1;
    const score = Number(item.rataRata || item.rata);
    if (!Number.isNaN(score)) current.rataValues.push(score);

    if (!current.tanggalTerakhir || String(item.tanggalSetor || item.tanggal || '') >= String(current.tanggalTerakhir)) {
      current.tanggalTerakhir = item.tanggalSetor || item.tanggal || '';
      current.juzTerakhir = item.juz || '-';
      current.surahTerakhir = item.surah || '-';
      current.statusTerakhir = item.statusHafalan || item.status || 'baru';
    }

    grouped.set(siswaId, current);
  });

  return Array.from(grouped.values()).map((row) => {
    if (!row.rataValues) return row;
    return {
      ...row,
      rataRata: row.rataValues.length
        ? row.rataValues.reduce((sum, value) => sum + value, 0) / row.rataValues.length
        : 0,
      rataValues: undefined
    };
  });
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '0.0' : number.toFixed(1);
}
