import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import type { ServerResponse, IncomingMessage } from "node:http";
import { createGitHubActionsServer } from "../src/server.js";

const handler = createMcpHandler(
  () => createGitHubActionsServer(),
  { responseMode: "json" },
);

const nodeHandler = toNodeHandler(handler);

export default async function (req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET") {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Method GET not allowed. Use POST with JSON-RPC body.",
      }),
    );
    return;
  }

  await nodeHandler(req, res);
}
