import { useState, useContext } from "react";
import useMediaQuery from "../hooks/useMediaQuery.jsx";
import ImageModal from "./ImageModal.jsx";
import Button from "./Button.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ChatHeader({ contact, lastSeenText, typingText, onBlock, onUnblock, onDelete }) {
  const [previewSrc, setPreviewSrc] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!contact) {
    return (
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 text-center text-sm text-slate-500">
        Select a conversation to start chatting.
      </div>
    );
  }

  const statusClass = contact.isOnline
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-500";

  const isBlocked = user?.user?.blockedUsers?.includes(contact.tag);

  const handleBlock = () => {
    if (onBlock) onBlock(contact.tag);
    setMenuOpen(false);
  };

  const handleUnblock = () => {
    setConfirmOpen(true);
    setMenuOpen(false);
  };

  const confirmUnblock = () => {
    if (onUnblock) onUnblock(contact.tag);
    setConfirmOpen(false);
  };

  const cancelUnblock = () => {
    setConfirmOpen(false);
  };

  const handleDelete = async () => {
    try {
      if (!contact?.tag) {
        console.warn("handleDelete called without a contact tag", contact);
        return false;
      }
      console.debug("ChatHeader handleDelete", contact.tag);
      setMenuOpen(false);
      if (onDelete) {
        await onDelete(contact.tag);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete chat:", err);
      return false;
    }
  };

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-indigo-950 text-white shadow-md">
            {contact.profilePicture ? (
              <img
                src={contact.profilePicture}
                alt={contact.name}
                className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-150"
                onClick={() => setPreviewSrc(contact.profilePicture)}
              />
            ) : (
              <span className="text-xl font-bold">{contact.name?.charAt(0).toUpperCase() || "U"}</span>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 rounded-full border-2 border-white ${
                contact.isOnline ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Chatting with</p>
            <h2 className="text-2xl font-bold text-slate-950">{contact.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{contact.tag}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusClass}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${contact.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                {contact.isOnline ? "Online" : "Offline"}
              </span>
              <span>{lastSeenText}</span>
              {typingText ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-700" />
                  {typingText} is typing...
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm sm:mr-2">
            Secure channel
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen((s) => !s)}
              aria-label="Open conversation actions"
              title="Conversation actions"
            >
              •••
            </Button>
            {menuOpen && (
              <div className={isMobile ? "fixed inset-x-3 bottom-4 rounded-3xl border bg-white p-3 shadow-xl z-50" : "absolute right-0 mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-xl border bg-white p-2 shadow-lg z-50"}>
                {!isMobile && (
                  <div className="absolute -top-2 right-4 h-3 w-3 rotate-45 bg-white border-t border-l border-slate-200" aria-hidden="true" />
                )}
                <div className="px-3 py-2 text-xs text-slate-500 font-semibold">Conversation actions</div>
                <div className="mt-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 text-left px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                    onClick={isBlocked ? handleUnblock : handleBlock}
                  >
                    <svg className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    <span>{isBlocked ? "Unblock user" : "Block user"}</span>
                  </button>
                </div>

                <div className="my-1 border-t border-slate-100" />

                <div className="mt-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 text-left px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                    onClick={handleDelete}
                  >
                    <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                    <span>Delete chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {previewSrc && <ImageModal src={previewSrc} alt="Profile preview" onClose={() => setPreviewSrc(null)} />}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-950">Confirm unblock</h3>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to unblock {contact.name || contact.tag}? They will be able to send messages and see your presence again.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="sm" onClick={cancelUnblock}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={confirmUnblock}>Unblock</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
