import { useState } from 'react';
import { getRiwayatHafalanSiswa } from './hafalanService.js';

export default function HafalanRiwayatPage() {
  const [siswaId, setSiswaId] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!siswaId.trim()) {
      setError('Siswa ID wajib diisi.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await getRiwayatHafalanSiswa({ siswaId });
      setItems(data.items || []);
    } catch (err) {
      setItems([]);
      setError(err.message || 'Gagal memuat riwayat hafalan');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Hafalan Al-Qur'an</p>
        <h2>Riwayat Hafalan</h2>
        <p>Lihat urutan setoran hafalan terbaru berdasarkan siswa.</p>
      </div>

      <form className="panel compact-filter" onSubmit={handleSubmit}>
        <label>
          Siswa ID
          <input value={siswaId} onChange={(event) => setSiswaId(event.target.value)} placeholder="SIS001" />
        </label>
        <button className="button button-secondary" type="submit" disabled={isLoading}>
          {isLoading ? 'Memuat...' : 'Tampilkan Riwayat'}
        </button>
      </form>

      {error ? <p className="notice error">{error}</p> : null}

      <section className="panel">
        <div className="panel-header">
          <h3>Riwayat Setoran</h3>
          <span>{items.length} data</span>
        </div>
        {isLoading ? (
          <div className="table-empty">Memuat riwayat...</div>
        ) : items.length ? (
          <HafalanTable items={items} />
        ) : (
          <div className="table-empty">Belum ada riwayat hafalan.</div>
        )}
      </section>
    </section>
  );
}

function HafalanTable({ items }) {
  return (
    <div className="table-wrap">
      <table className="data-table hafalan-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Siswa ID</th>
            <th>Juz</th>
            <th>Surah</th>
            <th>Ayat</th>
            <th>Status</th>
            <th>Rata</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.hafalanId || `${item.siswaId}-${item.tanggalSetor}-${item.ayatAwal}`}>
              <td>{item.tanggalSetor || '-'}</td>
              <td>{item.siswaId || '-'}</td>
              <td>{item.juz || '-'}</td>
              <td>{item.surah || '-'}</td>
              <td>{item.ayatAwal || '-'}-{item.ayatAkhir || '-'}</td>
              <td><span className={`status-badge status-${item.statusHafalan || 'aktif'}`}>{item.statusHafalan || '-'}</span></td>
              <td>{formatNumber(item.rataRata)}</td>
              <td>{item.catatan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? '-' : number.toFixed(1);
}
