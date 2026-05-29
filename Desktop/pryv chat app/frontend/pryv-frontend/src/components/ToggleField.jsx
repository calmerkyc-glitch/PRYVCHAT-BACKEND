export default function ToggleField({ title, description, checked, onChange, inputId }) {
  return (
    <label htmlFor={inputId} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-slate-300 text-indigo-600"
      />
    </label>
  );
}
