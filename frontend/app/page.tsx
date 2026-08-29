"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import ChatMessage from "./components/ChatMessage";
import Composer from "./components/Composer";
import EmptyState from "./components/EmptyState";
import type { Message } from "./lib/chat";

export default function Home() {
  const { messages, sendMessage, status, error } = useChat();
  const streamRef = useRef<HTMLDivElement>(null);

  const thinking = status === "submitted" || status === "streaming";

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    sendMessage({ text });
  }

  // Flatten an AI SDK UIMessage's text parts into the ChatMessage view model.
  function toView(m: (typeof messages)[number]): Message {
    const text = m.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
    return { id: m.id, role: m.role === "user" ? "user" : "assistant", text };
  }

  const views = messages.map(toView).filter((v) => v.text.trim().length > 0);
  const hasMessages = views.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-accent-strong font-display text-sm text-paper"
            >
              H
            </span>
            <span className="font-display text-xl text-ink">Hearth</span>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            <span className="size-2 rounded-full bg-support" aria-hidden />
            Kitchen open
          </span>
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
              <div className="flex items-center gap-3" aria-live="polite">
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-full bg-accent-strong font-display text-sm text-paper"
                >
                  H
                </span>
                <span className="flex gap-1 rounded-2xl rounded-bl-sm border border-line bg-paper-2 px-4 py-3">
                  <span className="dot size-1.5 rounded-full bg-ink-faint" />
                  <span className="dot size-1.5 rounded-full bg-ink-faint" />
                  <span className="dot size-1.5 rounded-full bg-ink-faint" />
                </span>
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
    </div>
  );
}
