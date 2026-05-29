import { useState } from "react";
import ImageModal from "./ImageModal.jsx";

export default function ContactsList({
  title = "Chats",
  contacts = [],
  selectedTag,
  onSelect,
  searchValue,
  onSearchChange,
}) {
  const [previewSrc, setPreviewSrc] = useState(null);
  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</p>
            <h2 className="text-xl font-bold text-slate-950">{contacts.length} {title.toLowerCase()}</h2>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="contact-search" className="sr-only">Search contacts</label>
          <input
            id="contact-search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search contacts"
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {contacts.length === 0 ? (
          <div className="mt-12 text-center text-sm text-slate-500">No conversations yet. Start a chat by selecting a contact.</div>
        ) : (
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li key={contact.tag}>
                <button
                  type="button"
                  onClick={() => onSelect(contact.tag)}
                  aria-current={selectedTag === contact.tag ? "true" : undefined}
                  className={`group w-full text-left rounded-3xl border p-3 transition duration-200 ease-out ${
                    selectedTag === contact.tag ? "border-indigo-500 bg-white shadow-sm" : "border-transparent bg-white/80 hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl bg-indigo-950 text-white">
                      {contact.profilePicture ? (
                        <img
                          src={contact.profilePicture}
                          alt={contact.name}
                          className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-150"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewSrc(contact.profilePicture);
                          }}
                        />
                      ) : (
                        <span className="text-lg font-semibold">{contact.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{contact.name || "Unknown"}</p>
                          <p className="truncate text-xs text-slate-400">{contact.tag}</p>
                        </div>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-slate-400">{new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm text-slate-500">{contact.lastMessage || "Start a new conversation"}</p>
                        {contact.selectedButNotViewed && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                            Not viewed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${contact.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{contact.isOnline ? "Online" : "Offline"}</span>
                    </span>
                    {contact.unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-950 px-2 py-1 text-white">{contact.unreadCount}</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {previewSrc && <ImageModal src={previewSrc} alt="Profile preview" onClose={() => setPreviewSrc(null)} />}
      </div>
    </div>
  );
}
