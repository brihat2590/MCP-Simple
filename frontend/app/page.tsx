"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import ChatMessage from "./components/ChatMessage";
import Composer from "./components/Composer";
import EmptyState from "./components/EmptyState";
import OrdersPanel from "./components/OrdersPanel";
import { ReceiptIcon } from "./components/Icons";
import { toMenu, toOrder } from "./lib/toolParts";
import type { Message } from "./lib/chat";

export default function Home() {
  const { messages, sendMessage, status, error } = useChat();
  const streamRef = useRef<HTMLDivElement>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const thinking = status === "submitted" || status === "streaming";

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    sendMessage({ text });
  }

  // Flatten an AI SDK UIMessage into the ChatMessage view model: the plain
  // text plus any menu/order payload surfaced by a get_menu / place_order
  // tool call, so photos and receipts render inline in the chat.
  function toView(m: (typeof messages)[number]): Message {
    const text = m.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");

    let menu: Message["menu"];
    let order: Message["order"];
    for (const part of m.parts) {
      if (part.type !== "dynamic-tool" || part.state !== "output-available") continue;
      if (part.toolName === "get_menu") menu = toMenu(part.output) ?? menu;
      if (part.toolName === "place_order") order = toOrder(part.output) ?? order;
    }

    return { id: m.id, role: m.role === "user" ? "user" : "assistant", text, menu, order };
  }

  const views = messages.map(toView).filter((v) => v.text.trim().length > 0 || v.menu || v.order);
  const hasMessages = views.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-2xl bg-accent-strong font-display text-base font-bold text-paper shadow-food"
            >
              H
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xl font-bold text-ink">Hearth</span>
              <span className="flex items-center gap-1 text-xs font-medium text-support">
                <span className="size-1.5 rounded-full bg-support" aria-hidden />
                Delivering now · 25–30 min
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOrdersOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-accent-strong px-4 py-2 text-sm font-semibold text-paper shadow-food transition-all duration-200 hover:bg-accent-hover hover:shadow-food-hover active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <ReceiptIcon size={15} />
              Orders
            </button>
          </div>
        </div>
      </header>

      <main
        ref={streamRef}
        className="stream mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4"
      >
        {!hasMessages ? (
          <EmptyState onPick={send} />
        ) : (
          <div className="flex flex-col gap-5 py-6">
            {views.map((m) => (
              <div key={m.id} className="animate-rise">
                <ChatMessage message={m} />
              </div>
            ))}

            {thinking && (
              <div className="flex items-start gap-3" aria-live="polite" aria-label="Assistant is thinking">
                <span
                  aria-hidden
                  className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent-strong font-display text-sm font-bold text-paper"
                >
                  H
                </span>
                <div className="min-w-0 max-w-[85%] flex-1 space-y-2.5 rounded-2xl rounded-bl-sm border border-line bg-paper-2 px-4 py-3.5">
                  <span className="shimmer block h-3 w-[70%] rounded-full" />
                  <span className="shimmer block h-3 w-[92%] rounded-full" />
                  <span className="shimmer block h-3 w-[45%] rounded-full" />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-accent-wash bg-accent-wash px-4 py-3 text-sm text-accent-strong">
                Something went wrong reaching the kitchen. Make sure the MCP server
                and your Groq key are set, then try again.
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <Composer onSend={send} disabled={thinking} />
          <p className="mt-2 text-center text-xs text-ink-faint">
            Hearth can make mistakes — confirm your order before checkout.
          </p>
        </div>
      </footer>

      <OrdersPanel open={ordersOpen} onClose={() => setOrdersOpen(false)} />
    </div>
  );
}
