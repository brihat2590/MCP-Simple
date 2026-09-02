"use client";

import { useCallback, useEffect, useState } from "react";
import type { PendingOrder } from "../lib/chat";
import { CloseIcon, RefreshIcon } from "./Icons";

function price(n: number): string {
  return `$${n.toFixed(2)}`;
}

// "Ready in ~3 min" / "Ready any moment" from the eta the backend computes.
function etaLabel(seconds?: number | null): string | null {
  if (seconds == null) return null;
  if (seconds <= 15) return "Ready any moment";
  const mins = Math.round(seconds / 60);
  if (mins <= 1) return "Ready in ~1 min";
  return `Ready in ~${mins} min`;
}

const STAGE = {
  pending: { label: "pending", badge: "bg-accent-wash text-accent-strong" },
  preparing: { label: "preparing", badge: "bg-gold-wash text-ink" },
} as const;

function stageStyle(status?: string) {
  return STAGE[status as keyof typeof STAGE] ?? STAGE.pending;
}

export default function OrdersPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load orders");
      setOrders(data.orders ?? []);
      setState("idle");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // Defer the initial fetch a tick so setState doesn't fire synchronously
    // within the effect body (avoids the cascading-render lint rule).
    const kickoff = setTimeout(load, 0);
    const id = setInterval(load, 15000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [open, load]);

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={[
          "fixed inset-0 z-20 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Panel */}
      <aside
        aria-label="Pending orders"
        aria-hidden={!open}
        className={[
          "fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-line bg-paper shadow-2xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Active orders</h2>
            <p className="text-xs text-ink-faint">In the kitchen — by guest name</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pending orders"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-paper-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {state === "loading" && orders.length === 0 && (
            <div className="flex flex-col gap-3" aria-live="polite">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-paper-2" />
              ))}
            </div>
          )}

          {state === "error" && (
            <p className="rounded-xl border border-accent-wash bg-accent-wash px-4 py-3 text-sm text-accent-strong">
              Couldn&apos;t reach the kitchen. Is the MCP server running?
            </p>
          )}

          {state !== "error" && !(state === "loading" && orders.length === 0) && orders.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-faint">
              No active orders — the kitchen is caught up.
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {orders.map((order, idx) => {
              const stage = stageStyle(order.status);
              const eta = etaLabel(order.eta_seconds);
              return (
              <li
                key={`${order.customer_name}-${idx}`}
                className="animate-rise overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-food"
              >
                <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
                  <span className="font-medium text-ink">{order.customer_name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${stage.badge}`}>
                    {stage.label}
                  </span>
                </div>
                <ul className="divide-y divide-line/60 px-4">
                  {order.items.map((line, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-ink-soft">
                        <span className="font-mono text-ink-faint">{line.quantity}×</span> {line.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between px-4 py-2.5">
                  {eta ? (
                    <span className="text-xs font-medium text-support">{eta}</span>
                  ) : (
                    <span className="text-xs font-medium text-ink-faint">Total</span>
                  )}
                  <span className="font-mono text-sm font-semibold text-ink">{price(order.total)}</span>
                </div>
              </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={load}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <RefreshIcon size={15} />
            Refresh
          </button>
        </div>
      </aside>
    </>
  );
}
