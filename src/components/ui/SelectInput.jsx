export default function SelectInput({
  label,
  children,
  className = '',
  options,
  placeholder,
  error,
  helperText,
  ...props
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      <select
        className={`h-11 rounded-xl border bg-white px-3 text-sm shadow-inner shadow-slate-100/70 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
        }`}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options?.length
          ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error ? <span className="text-xs font-semibold text-rose-600">{error}</span> : null}
      {!error && helperText ? <span className="text-xs font-medium text-slate-500">{helperText}</span> : null}
    </label>
  );
}
