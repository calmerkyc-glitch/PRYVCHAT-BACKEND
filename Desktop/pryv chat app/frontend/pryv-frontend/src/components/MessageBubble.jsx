export default function MessageBubble({ message, isSender }) {
  const statusLabel =
    message.status === "seen"
      ? "Seen"
      : message.status === "delivered"
      ? "Delivered"
      : message.status === "sent"
      ? "Sent"
      : "Awaiting";

  return (
    <div className={`message-bubble flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-[26px] px-4 py-3 text-sm shadow-sm transition duration-200 ease-out ${
          isSender ? "bg-indigo-950 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-[11px] text-slate-400">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {isSender && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                message.status === "seen"
                  ? "bg-emerald-100 text-emerald-700"
                  : message.status === "sent"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
