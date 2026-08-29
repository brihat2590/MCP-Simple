import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { loadMcpTools } from "../../lib/mcp";

export const maxDuration = 30;

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const SYSTEM = `You are the warm, friendly host at Hearth, a restaurant.
Use the available tools to show the menu and place orders.
Always call get_menu for real items and prices — never invent menu items.
When a customer wants to order, confirm the items and then call place_order.
After placing an order, tell the customer their order id and total.
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
