import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Edit3, Loader2, Printer, Save, TrendingDown, TrendingUp, Users } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterBar from '../../components/ui/FilterBar.jsx';
import FormModal from '../../components/ui/FormModal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PredikatBadge, { getPredikat } from '../../components/ui/PredikatBadge.jsx';
import SelectInput from '../../components/ui/SelectInput.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { getCurrentUser } from '../auth/authService.js';
import { ROLES } from '../auth/roles.js';
import { getKelasList } from '../kelas/kelasService.js';
import { getMapelList } from '../mapel/mapelService.js';
import { getSiswaList } from '../siswa/siswaService.js';
import { getRekapNilai, updateNilai } from './nilaiService.js';

const initialFilters = {
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kelasId: '',
  siswaId: '',
  mapelId: ''
};

export default function NilaiRekapPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [kelasRows, setKelasRows] = useState([]);
  const [siswaRows, setSiswaRows] = useState([]);
  const [mapelRows, setMapelRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [masterError, setMasterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const canViewAllClasses = useMemo(() => {
    if (!currentUser) return false;
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KEPALA_SEKOLAH].includes(currentUser.role);
  }, [currentUser]);
  const canEditNilai = useMemo(() => {
    if (!currentUser) return false;
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GURU_MAPEL].includes(currentUser.role);
  }, [currentUser]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    setIsLoadingMaster(true);
    Promise.all([
      getKelasList({ status: 'aktif', page: 1, limit: 200 }),
      getMapelList({ status: 'aktif', page: 1, limit: 200 })
    ])
      .then(([kelasData, mapelData]) => {
        setKelasRows(kelasData.items || []);
        setMapelRows(mapelData.items || []);
        setMasterError('');
      })
      .catch((err) => setMasterError(err.message || 'Gagal memuat data kelas atau mapel.'))
      .finally(() => setIsLoadingMaster(false));
  }, []);

  useEffect(() => {
    if (!filters.kelasId) {
      setSiswaRows([]);
      setFilters((current) => ({ ...current, siswaId: '' }));
      return;
    }

    getSiswaList({ kelasId: filters.kelasId, status: 'aktif', page: 1, limit: 200 })
      .then((data) => {
        setSiswaRows(data.items || []);
        setFilters((current) => ({ ...current, siswaId: '' }));
      })
      .catch((err) => {
        setSiswaRows([]);
        setError(err.message || 'Gagal memuat siswa pada kelas terpilih.');
      });
  }, [filters.kelasId]);

  const summary = useMemo(() => {
    const averages = rows.map((row) => Number(row.rataRata)).filter((value) => !Number.isNaN(value));
    const uniqueStudents = new Set(rows.map((row) => row.siswaId).filter(Boolean));
    const totalAverage = averages.length ? averages.reduce((sum, value) => sum + value, 0) / averages.length : 0;

    return {
      jumlahSiswa: uniqueStudents.size,
      rataRata: totalAverage,
      tertinggi: averages.length ? Math.max(...averages) : 0,
      terendah: averages.length ? Math.min(...averages) : 0
    };
  }, [rows]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canViewAllClasses && !filters.kelasId) {
      setError('Pilih kelas terlebih dahulu untuk menampilkan rekap nilai.');
      setRows([]);
      setHasSearched(true);
      return;
    }

    setError('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await getRekapNilai(filters);
      const normalizedRows = normalizeNilaiRows(data.items || data.rows || [], {
        siswaRows,
        mapelRows,
        filters
      });
      setRows(normalizedRows);
    } catch (err) {
      setRows([]);
      setError(err.message || 'Gagal memuat rekap nilai.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleOpenEdit(row) {
    const draft = {};
    ['harian', 'tugas', 'pts', 'pas'].forEach((jenis) => {
      const record = row.records?.[jenis];
      if (record?.nilaiId) {
        draft[jenis] = {
          nilaiId: record.nilaiId,
          nilai: record.nilai ?? '',
          catatan: record.catatan || ''
        };
      }
    });

    setEditTarget(row);
    setEditDraft(draft);
  }

  function handleEditChange(jenis, field, value) {
    setEditDraft((current) => ({
      ...current,
      [jenis]: {
        ...current[jenis],
        [field]: value
      }
    }));
  }

  async function handleSaveEdit(event) {
    event.preventDefault();

    const entries = Object.entries(editDraft).filter(([, value]) => value?.nilaiId);
    const invalid = entries.find(([, value]) => !isValidScore(value.nilai));

    if (!entries.length) {
      showToast({ title: 'Tidak ada nilai', description: 'Baris ini belum memiliki nilai yang bisa diedit.', variant: 'error' });
      return;
    }

    if (invalid) {
      showToast({ title: 'Nilai tidak valid', description: 'Nilai harus angka 0 sampai 100.', variant: 'error' });
      return;
    }

    setIsSavingEdit(true);

    try {
      await Promise.all(entries.map(([, value]) => updateNilai(value)));
      showToast({ title: 'Nilai diperbarui', description: `${editTarget?.namaLengkap || 'Data nilai'} berhasil diperbarui.`, variant: 'success' });
      setEditTarget(null);
      setEditDraft({});
      await handleSubmit({ preventDefault() {} });
    } catch (err) {
      showToast({ title: 'Gagal memperbarui nilai', description: err.message || 'Request gagal.', variant: 'error' });
    } finally {
      setIsSavingEdit(false);
    }
  }

  const columns = [
    { key: 'no', header: 'No', render: (_row, index) => index + 1 },
    { key: 'nis', header: 'NIS', render: (row) => row.nis || '-' },
    { key: 'namaLengkap', header: 'Nama siswa', render: (row) => row.namaLengkap || '-' },
    { key: 'namaKelas', header: 'Kelas', render: (row) => row.namaKelas || '-' },
    { key: 'namaMapel', header: 'Mapel', render: (row) => row.namaMapel || row.mapelId || '-' },
    { key: 'harian', header: 'Harian', render: (row) => formatNumber(row.harian) },
    { key: 'tugas', header: 'Tugas', render: (row) => formatNumber(row.tugas) },
    { key: 'pts', header: 'PTS', render: (row) => formatNumber(row.pts) },
    { key: 'pas', header: 'PAS', render: (row) => formatNumber(row.pas) },
    { key: 'rataRata', header: 'Rata-rata', render: (row) => formatNumber(row.rataRata) },
    {
      key: 'predikat',
      header: 'Predikat',
      render: (row) => <PredikatBadge value={row.predikat || getPredikat(row.rataRata)} />
    },
    ...(canEditNilai ? [{
      key: 'aksi',
      header: 'Aksi',
      render: (row) => (
        <button className="text-button inline-flex items-center gap-1" type="button" onClick={() => handleOpenEdit(row)} disabled={!hasEditableNilai(row)}>
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
      )
    }] : [])
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Nilai Akademik"
        title="Rekap Nilai"
        description="Lihat rekap nilai per kelas, siswa, mapel, semester, dan tahun ajaran."
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
          <SelectInput label="Semester" name="semester" value={filters.semester} onChange={handleChange}>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </SelectInput>
          <SelectInput label="Kelas" name="kelasId" value={filters.kelasId} onChange={handleChange} disabled={isLoadingMaster}>
            {canViewAllClasses && <option value="">{isLoadingMaster ? 'Memuat kelas...' : 'Semua kelas'}</option>}
            {!canViewAllClasses && <option value="">{isLoadingMaster ? 'Memuat kelas...' : 'Pilih kelas'}</option>}
            {kelasRows.map((kelas) => (
              <option key={kelas.kelasId} value={kelas.kelasId}>
                {kelas.namaKelas || kelas.kelasId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Siswa" name="siswaId" value={filters.siswaId} onChange={handleChange} disabled={!filters.kelasId}>
            <option value="">{filters.kelasId ? 'Semua siswa' : 'Pilih kelas dulu'}</option>
            {siswaRows.map((siswa) => (
              <option key={siswa.siswaId} value={siswa.siswaId}>
                {siswa.namaLengkap || siswa.siswaId}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Mapel" name="mapelId" value={filters.mapelId} onChange={handleChange}>
            <option value="">Semua mapel</option>
            {mapelRows.map((mapel) => (
              <option key={mapel.mapelId} value={mapel.mapelId}>
                {mapel.namaMapel || mapel.mapelId}
              </option>
            ))}
          </SelectInput>
        </FilterBar>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Jumlah siswa" value={summary.jumlahSiswa} description="Siswa pada hasil rekap" icon={Users} tone="emerald" />
        <StatCard title="Rata-rata kelas" value={formatNumber(summary.rataRata)} description="Rata-rata semua baris" icon={BarChart3} tone="slate" />
        <StatCard title="Nilai tertinggi" value={formatNumber(summary.tertinggi)} description="Berdasarkan rata-rata" icon={TrendingUp} tone="amber" />
        <StatCard title="Nilai terendah" value={formatNumber(summary.terendah)} description="Berdasarkan rata-rata" icon={TrendingDown} tone="rose" />
      </div>

      <section className="print-area rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Tabel Rekap Nilai</h2>
            <p className="text-sm text-slate-500">
              {canViewAllClasses 
                ? 'Pilih "Semua kelas" untuk perbandingan antar kelas, atau pilih kelas tertentu untuk melihat detail per kelas.'
                : 'Pilih kelas dan siswa untuk melihat rekap nilai.'}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-500">{rows.length} data</span>
        </div>

        {error ? (
          <ErrorState description={error} onRetry={() => handleSubmit({ preventDefault() {} })} />
        ) : !hasSearched ? (
          <EmptyState 
            title="Tentukan filter rekap" 
            description={canViewAllClasses 
              ? 'Klik Tampilkan untuk memuat rekap nilai. Pilih kelas untuk detail per kelas, atau biarkan kosong untuk semua kelas.'
              : 'Pilih kelas lalu klik Tampilkan untuk memuat rekap nilai.'} 
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            keyField="id"
            loading={isLoading}
            emptyTitle="Belum ada rekap nilai"
            emptyDescription="Data akan tampil setelah backend mengembalikan hasil getRekapNilai."
          />
        )}
      </section>

      <FormModal
        open={Boolean(editTarget)}
        title="Edit Nilai"
        description="Perbarui nilai yang sudah tersimpan. Nilai kosong belum bisa diedit dari rekap."
        onClose={() => setEditTarget(null)}
      >
        <form className="space-y-5" onSubmit={handleSaveEdit}>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-950">{editTarget?.namaLengkap || '-'}</p>
            <p className="mt-1 text-sm text-slate-500">{editTarget?.namaKelas || '-'} · {editTarget?.namaMapel || '-'}</p>
          </div>

          <div className="grid gap-4">
            {['harian', 'tugas', 'pts', 'pas'].map((jenis) => (
              <NilaiEditField
                key={jenis}
                jenis={jenis}
                draft={editDraft[jenis]}
                onChange={handleEditChange}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button className="button button-secondary" type="button" onClick={() => setEditTarget(null)}>
              Batal
            </button>
            <button className="button button-primary gap-2" type="submit" disabled={isSavingEdit}>
              {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </FormModal>
    </section>
  );
}

function NilaiEditField({ jenis, draft, onChange }) {
  const label = { harian: 'Harian', tugas: 'Tugas', pts: 'PTS', pas: 'PAS' }[jenis];

  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-4 disabled:opacity-60" disabled={!draft?.nilaiId}>
      <legend className="px-1 text-sm font-semibold text-slate-700">{label}</legend>
      {draft?.nilaiId ? (
        <div className="grid gap-3 md:grid-cols-[140px_1fr]">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Nilai
            <input
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="0"
              max="100"
              value={draft.nilai}
              onChange={(event) => onChange(jenis, 'nilai', event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Catatan
            <input
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={draft.catatan}
              onChange={(event) => onChange(jenis, 'catatan', event.target.value)}
              placeholder="Opsional"
            />
          </label>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Belum ada nilai {label.toLowerCase()} yang tersimpan.</p>
      )}
    </fieldset>
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

function normalizeNilaiRows(items, { siswaRows, mapelRows, filters }) {
  const siswaMap = new Map(siswaRows.map((siswa) => [siswa.siswaId, siswa]));
  const mapelMap = new Map(mapelRows.map((mapel) => [mapel.mapelId, mapel]));
  const kelasMap = new Map();
  
  siswaRows.forEach((siswa) => {
    if (siswa.kelasId && siswa.namaKelas) {
      kelasMap.set(siswa.kelasId, siswa.namaKelas);
    }
  });
  
  const rows = [];
  const grouped = new Map();

  items.forEach((item, index) => {
    const siswaId = item.siswaId || filters.siswaId || `siswa-${index}`;
    const mapelId = item.mapelId || filters.mapelId || item.namaMapel || 'semua-mapel';
    const key = `${siswaId}-${mapelId}`;
    const student = siswaMap.get(siswaId) || {};
    const subject = mapelMap.get(mapelId) || {};
    const current = grouped.get(key) || {
      id: key,
      siswaId,
      mapelId,
      nis: item.nis || student.nis || '-',
      namaLengkap: item.namaLengkap || item.namaSiswa || student.namaLengkap || siswaId,
      namaKelas: item.namaKelas || kelasMap.get(item.kelasId) || kelasMap.get(student.kelasId) || '-',
      namaMapel: item.namaMapel || subject.namaMapel || mapelId,
      harian: item.harian,
      tugas: item.tugas,
      pts: item.pts || item.PTS,
      pas: item.pas || item.PAS,
      rataRata: item.rataRata || item.rata || item.nilaiAkhir,
      predikat: item.predikat,
      records: {}
    };

    const jenis = String(item.jenisNilai || '').toLowerCase();
    if (['harian', 'tugas', 'pts', 'pas'].includes(jenis)) {
      current.records[jenis] = item;
    }
    if (jenis === 'harian') current.harian = item.nilai;
    if (jenis === 'tugas') current.tugas = item.nilai;
    if (jenis === 'pts') current.pts = item.nilai;
    if (jenis === 'pas') current.pas = item.nilai;

    grouped.set(key, current);
  });

  grouped.forEach((row) => {
    const scores = [row.harian, row.tugas, row.pts, row.pas]
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value));
    const rataRata = Number(row.rataRata);
    rows.push({
      ...row,
      rataRata: Number.isNaN(rataRata)
        ? scores.length
          ? scores.reduce((sum, value) => sum + value, 0) / scores.length
          : ''
        : rataRata
    });
  });

  return rows;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '-' : number.toFixed(1);
}

function isValidScore(value) {
  const number = Number(value);
  return value !== '' && !Number.isNaN(number) && number >= 0 && number <= 100;
}

function hasEditableNilai(row) {
  return Object.values(row.records || {}).some((record) => record?.nilaiId);
}
