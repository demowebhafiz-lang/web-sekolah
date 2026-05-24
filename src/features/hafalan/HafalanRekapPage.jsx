import { useState } from 'react';
import { getRekapHafalan } from './hafalanService.js';

const initialFilters = {
  kelasId: '',
  siswaId: '',
  juz: '',
  statusHafalan: ''
};

export default function HafalanRekapPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, rataRata: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await getRekapHafalan(filters);
      setItems(data.items || []);
      setSummary({
        total: data.total || 0,
        rataRata: data.rataRata || 0
      });
    } catch (err) {
      setItems([]);
      setSummary({ total: 0, rataRata: 0 });
      setError(err.message || 'Gagal memuat rekap hafalan');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Hafalan Al-Qur'an</p>
        <h2>Rekap Hafalan</h2>
        <p>Filter rekap berdasarkan kelas, siswa, juz, dan status hafalan.</p>
      </div>

      <form className="panel hafalan-filter" onSubmit={handleSubmit}>
        <label>
          Kelas ID
          <input name="kelasId" value={filters.kelasId} onChange={handleChange} placeholder="KLS001" />
        </label>
        <label>
          Siswa ID
          <input name="siswaId" value={filters.siswaId} onChange={handleChange} placeholder="SIS001" />
        </label>
        <label>
          Juz
          <input name="juz" type="number" min="1" max="30" value={filters.juz} onChange={handleChange} />
        </label>
        <label>
          Status
          <select name="statusHafalan" value={filters.statusHafalan} onChange={handleChange}>
            <option value="">Semua</option>
            <option value="baru">Baru</option>
            <option value="lancar">Lancar</option>
            <option value="perlu_perbaikan">Perlu Perbaikan</option>
            <option value="murajaah">Murajaah</option>
            <option value="selesai">Selesai</option>
          </select>
        </label>
        <button className="button button-secondary" type="submit" disabled={isLoading}>
          {isLoading ? 'Memuat...' : 'Tampilkan'}
        </button>
      </form>

      {error ? <p className="notice error">{error}</p> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Setoran</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="stat-card">
          <span>Rata-rata Hafalan</span>
          <strong>{formatNumber(summary.rataRata)}</strong>
        </article>
        <article className="stat-card">
          <span>Hasil Filter</span>
          <strong>{items.length}</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Data Rekap</h3>
          <span>{items.length} data</span>
        </div>
        {isLoading ? (
          <div className="table-empty">Memuat rekap...</div>
        ) : items.length ? (
          <div className="table-wrap">
            <table className="data-table hafalan-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Siswa ID</th>
                  <th>Kelas</th>
                  <th>Juz</th>
                  <th>Surah</th>
                  <th>Ayat</th>
                  <th>Status</th>
                  <th>Rata</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.hafalanId || `${item.siswaId}-${item.tanggalSetor}-${item.ayatAwal}`}>
                    <td>{item.tanggalSetor || '-'}</td>
                    <td>{item.siswaId || '-'}</td>
                    <td>{item.kelasId || '-'}</td>
                    <td>{item.juz || '-'}</td>
                    <td>{item.surah || '-'}</td>
                    <td>{item.ayatAwal || '-'}-{item.ayatAkhir || '-'}</td>
                    <td><span className={`status-badge status-${item.statusHafalan || 'aktif'}`}>{item.statusHafalan || '-'}</span></td>
                    <td>{formatNumber(item.rataRata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty">Belum ada data rekap.</div>
        )}
      </section>
    </section>
  );
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '0.0' : number.toFixed(1);
}
