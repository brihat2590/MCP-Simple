// Types + a local stand-in responder for the chat UI.
// These shapes mirror the Python MCP tools (get_menu / place_order) so the
// real /api/chat + Vercel AI SDK integration can replace `mockRespond` later
// without touching the components.

export type Role = "user" | "assistant";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

export type OrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type OrderCard = {
  orderId: number;
  status: string;
  total: number;
  lines: OrderLine[];
};

// Matches the Python `list_pending_orders` MCP tool's shape — no order id,
// active orders are always identified by the customer's name. `status` is the
// live stage ("pending" | "preparing") and `eta_seconds` is the time until the
// order is ready/complete.
export type PendingOrder = {
  customer_name: string;
  status?: string;
  eta_seconds?: number | null;
  total: number;
  items: { name: string; quantity: number; unit_price: number }[];
};

export type Message = {
  id: string;
  role: Role;
  text: string;
  // Optional rich payloads a tool call would produce.
  menu?: MenuItem[];
  order?: OrderCard;
};

// Mirrors the seeded rows in the backend SQLite database.
export const MENU: MenuItem[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Tomato, mozzarella, basil",
    price: 9.99,
    category: "pizza",
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    description: "Pepperoni and cheese",
    price: 11.99,
    category: "pizza",
    imageUrl:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons",
    price: 6.5,
    category: "salad",
    imageUrl:
      "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Coca-Cola",
    description: "330ml can",
    price: 1.99,
    category: "drink",
    imageUrl:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Tiramisu",
    description: "Classic Italian dessert",
    price: 5.5,
    category: "dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop&auto=format",
  },
];

export const SUGGESTIONS = [
  "Show me the menu",
  "What pizzas do you have?",
  "I'd like a Margherita and a Coke",
  "Any dessert?",
  "Show pending orders",
];

let counter = 0;
export function newId(): string {
  counter += 1;
  return `m_${Date.now()}_${counter}`;
}

// Temporary local logic. Replace with a call to /api/chat (Groq + MCP tools).
export function mockRespond(input: string): Message {
  const text = input.toLowerCase();

  if (text.includes("menu") || text.includes("pizza") || text.includes("dessert") || text.includes("drink")) {
    const filtered = text.includes("pizza")
      ? MENU.filter((m) => m.category === "pizza")
      : text.includes("dessert")
        ? MENU.filter((m) => m.category === "dessert")
        : MENU;
    return {
      id: newId(),
      role: "assistant",
      text: "Here's what the kitchen has ready tonight — tell me what you'd like and I'll start an order.",
      menu: filtered,
    };
  }

  if (text.includes("order") || text.includes("i'd like") || text.includes("get me") || text.includes("i want")) {
    const lines: OrderLine[] = [{ name: "Margherita Pizza", quantity: 1, unitPrice: 9.99 }];
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    return {
      id: newId(),
      role: "assistant",
      text: "Great — I've started an order for you. (Demo response — real ordering arrives once the chat API is wired in.)",
      order: { orderId: 1001, status: "pending", total, lines },
    };
  }

  return {
    id: newId(),
    role: "assistant",
    text: "I'm the Hearth host — ask to see the menu, or tell me what you'd like to eat and I'll put an order together.",
  };
}
