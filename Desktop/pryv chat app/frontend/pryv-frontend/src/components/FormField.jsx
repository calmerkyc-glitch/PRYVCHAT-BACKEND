export default function FormField({ label, subtitle, children, className = "" }) {
  return (
    <label className={`block rounded-3xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</span>
      {children}
      {subtitle && <p className="mt-3 text-sm text-slate-500">{subtitle}</p>}
    </label>
  );
}
