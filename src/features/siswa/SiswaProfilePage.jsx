import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AvatarImage from '../../components/AvatarImage.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { getSiswaList } from './siswaService.js';

export default function SiswaProfilePage() {
  const { siswaId } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(location.state?.student || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(!location.state?.student);

  useEffect(() => {
    if (student) {
      return;
    }

    getSiswaList({ page: 1, limit: 200, status: '' })
      .then((data) => {
        const found = (data.items || []).find((item) => String(item.siswaId) === String(siswaId));
        setStudent(found || null);
        setError(found ? '' : 'Data siswa tidak ditemukan.');
      })
      .catch((err) => setError(err.message || 'Gagal memuat profil siswa.'))
      .finally(() => setIsLoading(false));
  }, [siswaId, student]);

  if (isLoading) {
    return <LoadingState label="Memuat profil siswa..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Profil Siswa"
        title={student?.namaLengkap || 'Detail Siswa'}
        description="Ringkasan identitas siswa dan foto profil yang tersimpan di Google Drive."
        actions={<Link className="button button-secondary button-inline" to="/siswa">Kembali</Link>}
      />

      {error ? <p className="notice error">{error}</p> : null}

      {student ? (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <AvatarImage className="h-28 w-28 rounded-2xl text-3xl" name={student.namaLengkap} src={student.fotoUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{student.namaLengkap}</h2>
                <StatusBadge status={student.status || 'aktif'} />
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="NIS" value={student.nis} />
                <Info label="NISN" value={student.nisn} />
                <Info label="Jenis Kelamin" value={student.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'} />
                <Info label="Kelas ID" value={student.kelasId} />
                <Info label="Tempat/Tanggal Lahir" value={[student.tempatLahir, student.tanggalLahir].filter(Boolean).join(', ')} />
                <Info label="Orang Tua" value={student.namaOrangTua} />
                <Info label="No HP Orang Tua" value={student.noHpOrangTua} />
                <Info label="Alamat" value={student.alamat} />
              </dl>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-950">{value || '-'}</dd>
    </div>
  );
}
