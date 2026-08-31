import { createMcpHandler } from "@modelcontextprotocol/server";
import { createGitHubActionsServer } from "../src/server.js";

const handler = createMcpHandler(
  () => createGitHubActionsServer(),
  { responseMode: "json" },
);

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      return Response.json(
        { error: "Method GET not allowed. Use POST with JSON-RPC body." },
        { status: 400 },
      );
    }

    try {
      return await handler.fetch(request);
    } catch (err) {
      console.error("MCP handler error:", err);
      return Response.json(
        { error: (err as Error).message },
        { status: 500 },
      );
    }
  },
};
