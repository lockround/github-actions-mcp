import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createGitHubActionsServer } from "./server.js";

const handler = createMcpHandler(() => createGitHubActionsServer());

export default toNodeHandler(handler);
