export default function AccessDeniedPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Akses ditolak</p>
        <h2>Menu tidak tersedia untuk role Anda</h2>
        <p>Jika akses ini diperlukan, hubungi admin sekolah untuk memperbarui role akun.</p>
      </div>
      <div className="panel">
        <div className="table-empty">Role aktif tidak memiliki izin membuka halaman ini.</div>
      </div>
    </section>
  );
}
