import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { loadMcpTools } from "../../lib/mcp";

export const maxDuration = 30;

const MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

const SYSTEM = `You are the warm, friendly host at Hearth, a restaurant.
Use the available tools to show the menu and place orders.
Always call get_menu for real items and prices — never invent menu items.
When a customer wants to order, confirm the items and then call place_order.
After placing an order, tell the customer their order id and total, and let
them know their food will be ready in a few minutes.
Orders move through pending -> preparing -> ready on a timer ("ready" means the
order is complete). When asked about pending orders or "what's still cooking",
call list_pending_orders and refer to each one by the customer's name only —
never mention an order number for an active order. You may mention each order's
stage and roughly how long until it's ready (from eta_seconds).
Keep replies short, warm, and appetising.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Discover the MCP server's tools for this request.
  const { tools, close } = await loadMcpTools();

  const result = streamText({
    model: groq(MODEL),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    // Allow the model to call a tool, read the result, then answer.
    stopWhen: stepCountIs(5),
    onFinish: () => close(),
  });

  return result.toUIMessageStreamResponse();
}
