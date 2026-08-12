"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { replyToTicket, setTicketStatus } from "@/lib/actions/support";
import { TicketStatusBadge } from "./TicketStatusBadge";
import type { TicketDetailData, TicketStatus } from "@/lib/types/support";

const adminStatusOptions: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function TicketThread({
  ticket,
  isAdmin,
  backHref,
}: {
  ticket: TicketDetailData;
  isAdmin: boolean;
  backHref: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await replyToTicket(ticket.id, message);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage("");
    router.refresh();
  }

  async function handleStatusChange(status: TicketStatus) {
    const result = await setTicketStatus(ticket.id, status);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <a
          href={backHref}
          className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </a>
        <div className="flex-1">
          <h2 className="text-headline-lg text-on-surface">{ticket.subject}</h2>
          <p className="text-body-sm text-on-surface-variant font-mono">
            {ticket.ticketCode}
            {ticket.orderCode && ` · Order ${ticket.orderCode}`}
            {isAdmin && ticket.customerName && ` · ${ticket.customerName} (${ticket.customerEmail})`}
          </p>
        </div>
        {isAdmin ? (
          <select
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-3 py-2 text-on-surface-variant focus:ring-1 focus:ring-tertiary outline-none"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
          >
            {adminStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <TicketStatusBadge status={ticket.status} />
        )}
      </div>

      <div className="glass-panel rounded-xl p-stack-lg space-y-4">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAdminReply ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-lg rounded-xl p-4 ${
                msg.isAdminReply
                  ? "bg-surface-container-high text-on-surface"
                  : "bg-primary/10 text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-label-sm font-bold text-on-surface">
                  {msg.isAdminReply ? "Support Team" : msg.authorName}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  {msg.createdAtLabel}
                </span>
              </div>
              <p className="text-body-sm whitespace-pre-wrap">{msg.body}</p>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <form onSubmit={handleReply} className="glass-panel rounded-xl p-stack-lg space-y-3">
          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <textarea
            className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
            rows={3}
            placeholder="Write a reply..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reply"}
          </button>
        </form>
      )}
    </>
  );
}
