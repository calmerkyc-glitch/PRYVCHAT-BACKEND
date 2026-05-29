import { useMemo, useState } from "react";

export default function ProfilePreview({
  user,
  profilePicture,
  memberSince,
  contactsCount,
  verified,
  discoverable,
  showProfile,
  pendingRequests = 0,
  blockedCount = 0,
  onCopyHandle,
  onUploadClick,
}) {
  const [copied, setCopied] = useState(false);
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const completion = useMemo(() => {
    const checks = [
      !!profilePicture,
      !!user?.name,
      !!user?.bio,
      !!(user?.website || user?.twitter),
      !!discoverable,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [profilePicture, user, discoverable]);

  const handleCopy = async () => {
    await onCopyHandle?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white p-0 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.18)] sm:p-0">
      <div className="overflow-hidden rounded-[28px] bg-slate-50">
        <div className="relative overflow-hidden rounded-b-[36px] bg-emerald-600/10 px-5 pt-8 pb-6 sm:px-6">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-600 text-4xl font-black text-white shadow-[0_24px_50px_-28px_rgba(34,197,94,0.35)] sm:h-32 sm:w-32">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">{avatarInitial}</div>
            )}
          </div>

          <div className="mt-4 text-center sm:mt-5">
            <h2 className="text-2xl font-semibold text-slate-950">{user?.name || "Your name"}</h2>
            <p className="mt-1 text-sm text-slate-500">{user?.tag || "@pryv0000"}</p>
            <p className="mx-auto mt-2 max-w-[23rem] text-xs uppercase tracking-[0.24em] text-slate-400">
              Share this handle with others so they can find you quickly.
            </p>
            <p className="mx-auto mt-3 max-w-[23rem] text-sm leading-6 text-slate-600 sm:px-4">
              {user?.bio || "Hey there! I’m using Pryv Chat."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {verified ? "Verified" : "Unverified"}
            </span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${showProfile ? "bg-slate-100 text-slate-700" : "bg-slate-200 text-slate-500"}`}>
              {showProfile ? "Profile visible" : "Profile hidden"}
            </span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${discoverable ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
              {discoverable ? "Discoverable" : "Not discoverable"}
            </span>
          </div>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Member since</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{memberSince}</p>
            </div>
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Contacts</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{contactsCount}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-slate-100 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile completion</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{completion}% complete</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                {profilePicture ? "Photo set" : "Photo missing"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/70">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Requests</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{pendingRequests}</p>
            </div>
            <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/70">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Blocked</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{blockedCount}</p>
            </div>
            <div className="rounded-[24px] bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/70">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Visibility</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{showProfile ? "On" : "Off"}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              {copied ? "Handle copied" : "Copy handle"}
            </button>
            <button
              type="button"
              onClick={onUploadClick}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-700"
            >
              Change photo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

