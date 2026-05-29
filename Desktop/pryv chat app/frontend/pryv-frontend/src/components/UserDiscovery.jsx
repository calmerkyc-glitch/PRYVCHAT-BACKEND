import { useState } from "react";
import API from "../utils/api.js";
import Button from "./Button.jsx";
import ImageModal from "./ImageModal.jsx";

export default function UserDiscovery({ onStartChat, currentUserTag, onContactAdded, existingContacts = [], deletedChatTags = [], pendingSent = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  const isSaved = (userTag) => existingContacts.includes(userTag);
  const isPending = (userTag) => pendingSent.includes(userTag);
  const getActionLabel = (userTag) => {
    if (isSaved(userTag)) return "Added";
    if (isPending(userTag)) return "Pending";
    return "Add";
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/auth/users", {
        params: { q: searchQuery.trim() },
      });

      const filtered = res.data.filter((user) => user.tag !== currentUserTag);
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setError("No users found matching your search.");
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Failed to search users.";
      setError(message);
      setSuccess(null);
      console.error("User search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (user) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await API.post(`/auth/add-contact/${encodeURIComponent(user.tag)}`);
      const data = response.data;
      if (data.status === 'pending') {
        setSuccess(`Request sent to ${user.name || user.tag}.`);
      } else if (data.status === 'accepted' || data.status === 'already') {
        const addedContact = data.contact || data;
        onContactAdded?.(addedContact);
        setSuccess(`You added ${addedContact.name || addedContact.tag}.`);
      } else if (data.status === 'pending_already') {
        setSuccess(`Request already pending with ${user.name || user.tag}.`);
      } else {
        setSuccess(`Request processed.`);
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Failed to add contact.";
      setError(message);
      console.error("Add contact failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="px-4 py-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Search users</p>
            <h2 className="text-lg font-semibold text-slate-950">Discover People</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search by tag or name (e.g., @pryv1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full flex-1 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              {loading ? "..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4">
        {searchResults.length === 0 && !error && !searchQuery && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            <p className="font-semibold">Start discovering people</p>
            <p className="mt-1">Search for users by their tag or name to begin chatting.</p>
          </div>
        )}

        {searchResults.length === 1 && !error && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-indigo-950 text-3xl font-bold text-white">
                {searchResults[0].profilePicture ? (
                  <img
                    src={searchResults[0].profilePicture}
                    alt={searchResults[0].name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{searchResults[0].name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-950">{searchResults[0].name || "Unknown"}</p>
                <p className="text-sm text-slate-500">{searchResults[0].tag}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {deletedChatTags.includes(searchResults[0].tag) && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                      Previously deleted chat
                    </span>
                  )}
                  {isSaved(searchResults[0].tag) && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      Contact
                    </span>
                  )}
                  {isPending(searchResults[0].tag) && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                      Request pending
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Connect instantly with a secure profile search.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => handleAddContact(searchResults[0])}
                  variant={isSaved(searchResults[0].tag) || isPending(searchResults[0].tag) ? "secondary" : "primary"}
                  size="md"
                  disabled={loading || isSaved(searchResults[0].tag) || isPending(searchResults[0].tag)}
                  className="min-w-[120px]"
                >
                  {getActionLabel(searchResults[0].tag)}
                </Button>
                <Button
                  onClick={() => onStartChat(searchResults[0])}
                  variant="ghost"
                  size="md"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  Chat
                </Button>
              </div>
            </div>
          </div>
        )}

        {searchResults.length > 1 && (
          <div className="space-y-3">
            {searchResults.map((user) => (
              <div
                key={user.tag}
                className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-indigo-950 text-white font-semibold">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-150"
                        onClick={() => setPreviewSrc(user.profilePicture)}
                      />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{user.name || "Unknown"}</p>
                    <p className="truncate text-xs text-slate-500">{user.tag}</p>
                    {deletedChatTags.includes(user.tag) && (
                      <p className="mt-1 truncate text-[10px] uppercase tracking-[0.3em] text-amber-500">Previously deleted chat</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <Button
                    onClick={() => handleAddContact(user)}
                    variant={isSaved(user.tag) || isPending(user.tag) ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={loading || isSaved(user.tag) || isPending(user.tag)}
                  >
                    {isSaved(user.tag) ? "✓ Added" : isPending(user.tag) ? "Pending" : "Add"}
                  </Button>
                  <Button
                    onClick={() => onStartChat(user)}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {previewSrc && (
        <ImageModal src={previewSrc} alt="Profile preview" onClose={() => setPreviewSrc(null)} />
      )}
    </div>
  );
}
