import { MENU, SUGGESTIONS } from "../lib/chat";
import { CATEGORY_ICON, PlateIcon, SparkIcon } from "./Icons";

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const categories = Array.from(new Set(MENU.map((m) => m.category)));

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft shadow-food">
        <SparkIcon size={13} className="text-accent-strong" />
        Order in minutes, not miles
      </span>

      <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
        Hungry? <span className="text-accent-strong">Hearth</span> has you covered.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        Chat with our host to browse tonight&apos;s kitchen and order in seconds —
        no menus to scroll, no forms to fill.
      </p>

      <div className="mt-9 flex max-w-lg flex-wrap justify-center gap-2.5">
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c] ?? PlateIcon;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onPick(`Show me the ${c} menu`)}
              className={[
                "group flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-food transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent-strong hover:shadow-food-hover",
                "active:translate-y-0",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              ].join(" ")}
            >
              <Icon
                size={17}
                className="text-ink-faint transition-colors duration-200 group-hover:text-accent-strong"
              />
              <span className="capitalize">{c}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className={[
              "rounded-full border border-line bg-paper/60 px-4 py-2 text-sm text-ink-soft transition-all duration-200",
              "hover:border-accent/40 hover:bg-accent-wash hover:text-accent-strong",
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
