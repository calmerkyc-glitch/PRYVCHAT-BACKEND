import { useEffect } from "react";

export default function ImageModal({ src, alt = "Image preview", onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-2 py-1">
          <button
            onClick={onClose}
            aria-label="Close image preview"
            className="rounded-full bg-white/90 px-2 py-1 text-slate-700 shadow-sm hover:bg-white"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center justify-center p-2">
          <img src={src} alt={alt} className="max-h-[80vh] w-auto rounded-lg object-contain" />
        </div>
      </div>
    </div>
  );
}
