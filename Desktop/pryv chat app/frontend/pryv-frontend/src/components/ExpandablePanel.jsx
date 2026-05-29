import { useRef, useEffect, useState } from "react";

export default function ExpandablePanel({ id, icon, title, subtitle, isOpen, onToggle, actions, children }) {
  const contentRef = useRef(null);
  const [maxH, setMaxH] = useState("0px");

  useEffect(() => {
    if (!contentRef.current) return;
    // allow transition to animate if content changes while open
    if (isOpen) {
      setMaxH(`${contentRef.current.scrollHeight}px`);
      const ro = new ResizeObserver(() => {
        setMaxH(`${contentRef.current.scrollHeight}px`);
      });
      ro.observe(contentRef.current);
      return () => ro.disconnect();
    } else {
      setMaxH("0px");
    }
  }, [isOpen, children]);

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onToggle}
          aria-controls={id}
          aria-expanded={!!isOpen}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="text-xl sm:text-2xl">{icon}</span>
          <div className="flex-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">{subtitle || ""}</p>
            <h3 className="mt-1 text-sm sm:text-lg font-semibold text-slate-950">{title}</h3>
          </div>
        </button>
        <div className="ml-3 flex items-center gap-3">
          <div className="hidden sm:block">{actions}</div>
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div
        id={id}
        ref={contentRef}
        style={{ maxHeight: maxH }}
        className="overflow-hidden transition-all duration-300 px-4 sm:px-6"
        aria-hidden={!isOpen}
      >
        <div className="py-4 sm:py-6">{children}</div>
        <div className="block sm:hidden px-4 pb-4">{/* mobile action area */}
          {actions}
        </div>
      </div>
    </section>
  );
}
