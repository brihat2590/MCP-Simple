import type { Message, MenuItem, OrderCard } from "../lib/chat";

function price(n: number): string {
  return `$${n.toFixed(2)}`;
}

function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <ul className="mt-3 grid gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium text-ink">{item.name}</p>
            <p className="text-sm text-ink-soft">{item.description}</p>
            <span className="mt-1 inline-block rounded-full bg-support-wash px-2 py-0.5 text-xs font-medium text-support">
              {item.category}
            </span>
          </div>
          <span className="shrink-0 font-mono text-sm font-medium text-ink">
            {price(item.price)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OrderReceipt({ order }: { order: OrderCard }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-accent-wash bg-accent-wash">
      <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
        <span className="font-display text-lg text-ink">Order #{order.orderId}</span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium capitalize text-accent-strong">
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
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent-strong font-display text-sm text-paper"
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
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        </div>

        {message.menu && <MenuList items={message.menu} />}
        {message.order && <OrderReceipt order={message.order} />}
      </div>
    </div>
  );
}
