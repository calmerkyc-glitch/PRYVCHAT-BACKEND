export default function SettingsCard({ title, subtitle, children, actions }) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{subtitle}</h2>
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
