import { createMcpHandler } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServer } from "node:http";
import { createGitHubActionsServer } from "./server.js";

function parseArgs(): { transport: string; port: number } {
  const args = process.argv.slice(2);
  let transport = "stdio";
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--transport" && args[i + 1]) {
      transport = args[i + 1];
      i++;
    } else if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { transport, port };
}

const { transport, port } = parseArgs();

if (transport === "http") {
  const handler = createMcpHandler(() => createGitHubActionsServer());
  const nodeHandler = toNodeHandler(handler);

  const server = createServer(nodeHandler);

  server.listen(port, "127.0.0.1", () => {
    console.error(`GitHub Actions MCP server running on http://127.0.0.1:${port}/mcp`);
    console.error("Press Ctrl+C to stop");
  });

  process.on("SIGINT", async () => {
    await handler.close();
    server.close();
    process.exit(0);
  });
} else {
  // stdio mode (default)
  serveStdio(() => createGitHubActionsServer());
}
