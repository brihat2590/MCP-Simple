import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { PendingOrder } from "../../lib/chat";

const MCP_URL = process.env.MCP_SERVER_URL ?? "http://127.0.0.1:8000/mcp";

// Extracts the JSON payload a Python MCP tool call returns, whether the
// server sent it as `structuredContent` (optionally wrapped in `{ result }`)
// or only as a JSON string inside the first text content block.
function extractResult(res: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const structured = res.structuredContent as { result?: unknown } | undefined;
  if (structured && typeof structured === "object") {
    return "result" in structured ? structured.result : structured;
  }
  const content = res.content as Array<{ type: string; text?: string }> | undefined;
  const text = content?.find((c) => c.type === "text")?.text;
  return text ? JSON.parse(text) : [];
}

// Lets the UI show pending orders without going through the chat model —
// the "Orders" panel calls this directly.
export async function GET() {
  const client = new Client({ name: "hearth-frontend", version: "1.0.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));
    const res = await client.callTool({ name: "list_pending_orders", arguments: {} });
    const orders = extractResult(res) as PendingOrder[];
    return Response.json({ orders });
  } catch {
    return Response.json(
      { orders: [], error: "Couldn't reach the kitchen (MCP server offline?)." },
      { status: 502 },
    );
  } finally {
    await client.close();
  }
}
