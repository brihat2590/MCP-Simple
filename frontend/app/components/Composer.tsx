"use client";

import { useRef, useState } from "react";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !disabled;

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper p-2 shadow-sm focus-within:border-accent">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={autoGrow}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? "Hearth is replying…" : "Ask for the menu, or order something…"}
        aria-label="Message the Hearth host"
        className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="Send message"
        className={[
          "grid size-9 shrink-0 place-items-center rounded-xl transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          canSend
            ? "bg-accent-strong text-paper hover:bg-accent-hover active:translate-y-px"
            : "cursor-not-allowed bg-paper-3 text-ink-faint",
        ].join(" ")}
      >
        {disabled ? (
          <span className="flex gap-0.5" aria-hidden>
            <span className="dot size-1.5 rounded-full bg-current" />
            <span className="dot size-1.5 rounded-full bg-current" />
            <span className="dot size-1.5 rounded-full bg-current" />
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 12L20 4L13 20L11 13L4 12Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
