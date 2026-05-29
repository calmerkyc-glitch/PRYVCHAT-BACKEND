export default function SectionSidebar({ openSection, onSelect, blockedCount = 0, contactsCount = 0 }) {
  const sections = [
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "privacy", icon: "👁️", label: "Privacy" },
    { id: "security", icon: "🔒", label: "Security" },
    { id: "blocked", icon: "🚫", label: "Blocked" },
  ];

  return (
    <div className="sticky top-20 space-y-3">
      <nav className="hidden lg:block rounded-[20px] border border-slate-200 bg-white p-3">
        <ul className="flex flex-col gap-2">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium transition hover:bg-slate-50 ${openSection === s.id ? "bg-slate-100" : ""}`}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="text-lg">{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {s.id === "blocked" ? <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">{blockedCount}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="lg:hidden flex items-center justify-between gap-2 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`flex-shrink-0 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${openSection === s.id ? "bg-slate-100" : "bg-white"}`}
          >
            <span className="text-lg">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-[20px] border border-slate-200 bg-white p-3 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Quick stats</p>
        <div className="mt-2 grid gap-2">
          <div className="flex items-center justify-between">
            <span>Contacts</span>
            <span className="font-semibold text-slate-900">{contactsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Blocked</span>
            <span className="font-semibold text-slate-900">{blockedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
