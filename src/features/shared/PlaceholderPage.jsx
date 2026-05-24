export default function PlaceholderPage({ title, action }) {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Modul</p>
        <h2>{title}</h2>
        <p>{action}</p>
      </div>
      <div className="panel">
        <div className="table-empty">Halaman ini siap dihubungkan pada iterasi fitur berikutnya.</div>
      </div>
    </section>
  );
}
