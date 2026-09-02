import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { dynamicTool, jsonSchema, type ToolSet } from "ai";

const MCP_URL = process.env.MCP_SERVER_URL ?? "http://127.0.0.1:8000/mcp";

// Connects to the Python MCP server and exposes each of its tools as an
// AI SDK tool the Groq model can call. `dynamicTool` is used because the
// tool schemas are discovered at runtime, not known at compile time.
// Normalizes a tool call's result to a plain JS value: prefers the
// structured JSON payload, then falls back to parsing the JSON text out of
// the raw MCP content blocks (some tools — e.g. those returning a bare
// `dict` — don't get an output schema, so they only carry unstructured
// content even though the value itself is JSON).
function normalizeToolResult(res: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const structured = res.structuredContent as { result?: unknown } | undefined;
  if (structured && typeof structured === "object") {
    return "result" in structured ? structured.result : structured;
  }
  const content = res.content as Array<{ type: string; text?: string }> | undefined;
  const text = content?.find((c) => c.type === "text")?.text;
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return content;
}

export async function loadMcpTools(): Promise<{
  tools: ToolSet;
  close: () => Promise<void>;
}> {
  const client = new Client({ name: "hearth-frontend", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));

  const { tools: mcpTools } = await client.listTools();

  const tools: ToolSet = {};
  for (const t of mcpTools) {
    tools[t.name] = dynamicTool({
      description: t.description ?? "",
      inputSchema: jsonSchema(t.inputSchema as Parameters<typeof jsonSchema>[0]),
      execute: async (args) => {
        const res = await client.callTool({
          name: t.name,
          arguments: (args ?? {}) as Record<string, unknown>,
        });
        return normalizeToolResult(res);
      },
    });
  }

  return { tools, close: () => client.close() };
}

