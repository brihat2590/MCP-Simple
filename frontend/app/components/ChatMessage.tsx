import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReceiptIcon } from "./Icons";
import type { Message, MenuItem, OrderCard } from "../lib/chat";

function price(n: number): string {
  return `$${n.toFixed(2)}`;
}

function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="group overflow-hidden rounded-2xl border border-line bg-paper shadow-food transition duration-300 hover:-translate-y-1 hover:shadow-food-hover"
        >
          {item.imageUrl && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover transition duration-500 ease-out group-hover:scale-105"
              />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-paper/95 px-2.5 py-1 text-xs font-semibold capitalize text-accent-strong shadow-sm">
                {item.category}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-ink">{item.name}</p>
              <p className="truncate text-sm text-ink-soft">{item.description}</p>
              <span className="mt-1 inline-block font-mono text-sm font-semibold text-accent-strong">
                {price(item.price)}
              </span>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border-2 border-accent-strong bg-paper px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-accent-strong transition hover:bg-accent-strong hover:text-paper active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Add
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderReceipt({ order }: { order: OrderCard }) {
  return (
    <div className="mt-3 animate-rise overflow-hidden rounded-2xl border border-accent-wash bg-accent-wash shadow-food transition duration-300">
      <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
        <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <ReceiptIcon size={17} className="text-accent-strong" />
          Order #{order.orderId}
        </span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong">
          {order.status}
        </span>
      </div>
      <ul className="divide-y divide-line/60 px-4">
        {order.lines.map((line, i) => (
          <li key={i} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-ink">
              <span className="font-mono text-ink-soft">{line.quantity}×</span> {line.name}
            </span>
            <span className="font-mono text-ink">{price(line.unitPrice * line.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-ink-soft">Total</span>
        <span className="font-mono text-base font-semibold text-ink">{price(order.total)}</span>
      </div>
    </div>
  );
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div
          aria-hidden
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent-strong font-display text-sm font-bold text-paper"
        >
          H
        </div>
      )}

      <div className={`min-w-0 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm bg-accent-strong px-4 py-2.5 text-paper"
              : "rounded-2xl rounded-bl-sm border border-line bg-paper-2 px-4 py-2.5 text-ink"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
          ) : (
            <div className="markdown break-words leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.menu && <MenuList items={message.menu} />}
        {message.order && <OrderReceipt order={message.order} />}
      </div>
    </div>
  );
}
