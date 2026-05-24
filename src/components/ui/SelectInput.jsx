export default function SelectInput({ label, children, className = '', ...props }) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      <select
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
