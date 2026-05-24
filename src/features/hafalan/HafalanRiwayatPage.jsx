import { useEffect, useMemo, useState } from 'react';
import { Clock3, ListChecks, Search } from 'lucide-react';
import AvatarImage from '../../components/AvatarImage.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getKelasList } from '../kelas/kelasService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { getRiwayatHafalanSiswa } from './hafalanService.js';

const columns = [
  { key: 'tanggalSetor', header: 'Tanggal', render: (row) => row.tanggalSetor || row.tanggal || '-' },
  { key: 'juz', header: 'Juz', render: (row) => row.juz || '-' },
  { key: 'surah', header: 'Surah', render: (row) => row.surah || '-' },
  { key: 'ayat', header: 'Ayat', render: (row) => formatAyat(row) },
  {
    key: 'statusHafalan',
    header: 'Status',
    render: (row) => <StatusBadge status={row.statusHafalan || row.status || 'baru'} />
  },
  { key: 'rataRata', header: 'Rata-rata', render: (row) => formatNumber(row.rataRata || row.rata) },
  { key: 'catatan', header: 'Catatan', render: (row) => row.catatan || '-' }
];

export default function HafalanRiwayatPage() {
  const [kelasRows, setKelasRows] = useState([]);
  const [siswaRows, setSiswaRows] = useState([]);
  const [kelasId, setKelasId] = useState('');
  const [siswaId, setSiswaId] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [masterError, setMasterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);

  useEffect(() => {
    setIsLoadingKelas(true);
    getKelasList({ status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setKelasRows(data.items || []);
        setMasterError('');
      })
      .catch((err) => setMasterError(err.message || 'Gagal memuat data kelas.'))
      .finally(() => setIsLoadingKelas(false));
  }, []);

  useEffect(() => {
    setSiswaId('');
    setItems([]);
    setError('');

    if (!kelasId) {
      setSiswaRows([]);
      return;
    }

    setIsLoadingSiswa(true);
    getSiswaList({ kelasId, status: 'aktif', page: 1, limit: 200 })
      .then((data) => setSiswaRows(data.items || []))
      .catch((err) => {
        setSiswaRows([]);
        setError(err.message || 'Gagal memuat siswa pada kelas terpilih.');
      })
      .finally(() => setIsLoadingSiswa(false));
  }, [kelasId]);

  useEffect(() => {
    if (!siswaId) {
      setItems([]);
      return;
    }

    loadHistory(siswaId);
  }, [siswaId]);

  const selectedStudent = useMemo(
    () => siswaRows.find((siswa) => siswa.siswaId === siswaId),
    [siswaRows, siswaId]
  );
  const average = useMemo(() => {
    const scores = items.map((item) => Number(item.rataRata || item.rata)).filter((value) => !Number.isNaN(value));
    return scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  }, [items]);
  const lastItems = useMemo(() => items.slice(0, 5), [items]);

  async function loadHistory(nextSiswaId = siswaId) {
    if (!nextSiswaId) return;

    setError('');
    setIsLoading(true);

    try {
      const data = await getRiwayatHafalanSiswa({ siswaId: nextSiswaId });
      setItems(data.items || data.rows || []);
    } catch (err) {
      setItems([]);
      setError(err.message || 'Gagal memuat riwayat hafalan.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!kelasId) {
      setError('Pilih kelas terlebih dahulu.');
      return;
    }

    if (!siswaId) {
      setError('Pilih siswa untuk melihat riwayat hafalan.');
      return;
    }

    loadHistory();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Hafalan Al-Qur'an"
        title="Riwayat Hafalan"
        description="Pilih kelas lalu siswa untuk melihat profil ringkas dan riwayat setoran hafalan."
      />

      {masterError ? <ErrorState description={masterError} /> : null}

      <form className="no-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <SelectInput label="Kelas" value={kelasId} onChange={(event) => setKelasId(event.target.value)} disabled={isLoadingKelas}>
            <option value="">{isLoadingKelas ? 'Memuat kelas...' : 'Pilih kelas'}</option>
            {kelasRows.map((kelas) => (
              <option key={kelas.kelasId} value={kelas.kelasId}>
                {kelas.namaKelas || kelas.kelasId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Siswa" value={siswaId} onChange={(event) => setSiswaId(event.target.value)} disabled={!kelasId || isLoadingSiswa}>
            <option value="">{!kelasId ? 'Pilih kelas dulu' : isLoadingSiswa ? 'Memuat siswa...' : 'Pilih siswa'}</option>
            {siswaRows.map((siswa) => (
              <option key={siswa.siswaId} value={siswa.siswaId}>
                {siswa.namaLengkap || siswa.siswaId}
              </option>
            ))}
          </SelectInput>
          <button className="button button-primary" type="submit" disabled={isLoading || !kelasId || !siswaId}>
            <Search className="h-4 w-4" />
            Tampilkan
          </button>
        </div>
        {kelasId && !isLoadingSiswa && !siswaRows.length ? (
          <p className="mt-3 text-sm font-medium text-amber-700">Belum ada siswa di kelas ini.</p>
        ) : null}
      </form>

      {error ? <ErrorState description={error} onRetry={siswaId ? () => loadHistory() : undefined} /> : null}

      {selectedStudent ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <AvatarImage className="h-16 w-16 text-lg" name={selectedStudent.namaLengkap} src={selectedStudent.fotoUrl} />
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{selectedStudent.namaLengkap || '-'}</h2>
                <p className="text-sm text-slate-500">NIS {selectedStudent.nis || '-'}</p>
                <p className="text-sm text-slate-500">{selectedStudent.namaKelas || kelasName(kelasRows, kelasId)}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard title="Total setoran" value={items.length} description="Riwayat yang dimuat" icon={ListChecks} tone="emerald" />
            <StatCard title="Rata-rata hafalan" value={formatNumber(average)} description="Dari riwayat siswa" icon={Clock3} tone="amber" />
          </div>
        </section>
      ) : (
        <EmptyState title="Pilih siswa" description="Dropdown siswa akan aktif setelah kelas dipilih." />
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Riwayat Setoran</h2>
            <p className="text-sm text-slate-500">Data otomatis dimuat setelah siswa dipilih.</p>
          </div>
          <span className="text-sm font-medium text-slate-500">{items.length} data</span>
        </div>

        {!siswaId ? (
          <EmptyState title="Belum memilih siswa" description="Pilih kelas dan siswa untuk menampilkan riwayat hafalan." />
        ) : isLoading ? (
          <LoadingState label="Memuat riwayat hafalan..." />
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            keyField="hafalanId"
            emptyTitle="Belum ada riwayat hafalan"
            emptyDescription="Data akan tampil setelah backend mengembalikan hasil getRiwayatHafalanSiswa."
          />
        )}
      </section>

      {lastItems.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Timeline Terakhir</h2>
          <div className="mt-4 grid gap-3">
            {lastItems.map((item, index) => (
              <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3" key={item.hafalanId || `${item.tanggalSetor}-${index}`}>
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.surah || '-'} Juz {item.juz || '-'}</p>
                  <p className="text-sm text-slate-500">{item.tanggalSetor || '-'} - {formatAyat(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function kelasName(kelasRows, kelasId) {
  return kelasRows.find((kelas) => kelas.kelasId === kelasId)?.namaKelas || kelasId || '-';
}

function formatAyat(item) {
  const awal = item.ayatAwal || item.ayatMulai || item.ayat;
  const akhir = item.ayatAkhir;
  if (!awal && !akhir) return '-';
  return akhir ? `${awal || '-'}-${akhir}` : awal;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '0.0' : number.toFixed(1);
}
