import { SUGGESTIONS } from "../lib/chat";

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div
        aria-hidden
        className="grid size-14 place-items-center rounded-2xl bg-accent-strong font-display text-2xl text-paper"
      >
        H
      </div>

      <h1 className="mt-5 font-display text-3xl font-medium text-ink sm:text-4xl">
        Welcome to Hearth
      </h1>
      <p className="mt-2 max-w-md text-ink-soft">
        Order dinner by chatting with our host. Ask what&apos;s on tonight, or just
        say what you&apos;re hungry for.
      </p>

      <div className="mt-7 flex max-w-lg flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className={[
              "rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink transition",
              "hover:border-accent hover:bg-accent-wash hover:text-accent-strong",
              "active:translate-y-px",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
