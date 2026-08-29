import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { dynamicTool, jsonSchema, type ToolSet } from "ai";

const MCP_URL = process.env.MCP_SERVER_URL ?? "http://127.0.0.1:8000/mcp";

// Connects to the Python MCP server and exposes each of its tools as an
// AI SDK tool the Groq model can call. `dynamicTool` is used because the
// tool schemas are discovered at runtime, not known at compile time.
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
        return res.content;
      },
    });
  }

  return { tools, close: () => client.close() };
}
