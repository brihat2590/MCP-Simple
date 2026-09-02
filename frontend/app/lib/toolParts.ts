// Turns a `get_menu` / `place_order` dynamic-tool result (raw JSON from the
// Python MCP server, snake_case) into the rich view models ChatMessage
// renders — the menu photo grid and the order receipt.
import type { MenuItem, OrderCard, OrderLine } from "./chat";

type RawMenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string | null;
};

type RawOrder = {
  order_id: number;
  customer_name: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; unit_price: number }[];
};

function isRawMenu(value: unknown): value is RawMenuItem[] {
  return (
    Array.isArray(value) &&
    value.every((v) => v && typeof v === "object" && "price" in v && "category" in v)
  );
}

function isRawOrder(value: unknown): value is RawOrder {
  return (
    !!value &&
    typeof value === "object" &&
    "order_id" in value &&
    "items" in value &&
    Array.isArray((value as RawOrder).items)
  );
}

export function toMenu(value: unknown): MenuItem[] | undefined {
  if (!isRawMenu(value)) return undefined;
  return value.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.image_url ?? undefined,
  }));
}

export function toOrder(value: unknown): OrderCard | undefined {
  if (!isRawOrder(value)) return undefined;
  const lines: OrderLine[] = value.items.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unit_price,
  }));
  return {
    orderId: value.order_id,
    status: value.status,
    total: value.total,
    lines,
  };
}
