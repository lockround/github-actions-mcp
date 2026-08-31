# GitHub Actions MCP Server

MCP server for managing GitHub Actions workflows. Supports both **stdio** (default) and **HTTP** (Streamable HTTP) transports.

## Features

7 tools:

| Tool | Description |
|------|-------------|
| `parse-github-repo` | Parse a GitHub URL or `owner/repo` string into `{owner, repo}` |
| `list-workflows` | List all workflows in a repo |
| `get-workflow` | Get a specific workflow by ID or filename |
| `trigger-workflow` | Trigger a `workflow_dispatch` event with inputs |
| `get-workflow-run` | Get latest or specific workflow run status |
| `cancel-workflow-run` | Cancel a running workflow |
| `trigger-repository-dispatch` | Trigger a `repository_dispatch` event |

## Requirements

- Node.js >= 18
- A GitHub token with `repo` scope (`workflow` scope for triggering workflows):
  - `GITHUB_TOKEN` env var

## Build

```bash
npm install
npm run build
```

## Run

### stdio (default, for MCP hosts that spawn a child process)

```bash
GITHUB_TOKEN=xxx node dist/index.js
```

### HTTP (Streamable HTTP transport)

```bash
GITHUB_TOKEN=xxx node dist/index.js --transport http --port 3000
# → http://127.0.0.1:3000/mcp
```

### Via npx (after publishing)

```bash
GITHUB_TOKEN=xxx npx github-actions-mcp --transport http --port 3000
```

## Usage with opencode

Add to `opencode.json`:

```json
{
  "mcp": {
    "github-actions": {
      "type": "local",
      "command": ["node", "/path/to/dist/index.js"],
      "environment": { "GITHUB_TOKEN": "{env:GITHUB_TOKEN}" }
    }
  }
}
```

Or run over HTTP:

```json
{
  "mcp": {
    "github-actions": {
      "type": "remote",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

## Deploy on Vercel

The server can be deployed as a Vercel Node.js function that exposes the HTTP (Streamable HTTP) transport at `https://<your-app>.vercel.app/api/mcp`.

### Files

- `api/mcp.ts` — Vercel function adapter (Web Standard `fetch` export: rejects GET, proxies the POST body to the MCP handler)
- `vercel.json` — Node 20 runtime, `maxDuration: 30`
- `.env.example` — lists required `GITHUB_TOKEN` environment variable

### Steps

1. Set the `GITHUB_TOKEN` environment variable in the Vercel project settings (or via `vercel env add GITHUB_TOKEN`).
2. Deploy:

   ```bash
   vercel --prod
   ```

3. The MCP endpoint is `https://<your-app>.vercel.app/api/mcp`.

### Use with an MCP host

```json
{
  "mcpServers": {
    "github-actions": {
      "url": "https://<your-app>.vercel.app/api/mcp"
    }
  }
}
```

### Run locally with Vercel CLI

```bash
vercel dev
# → http://localhost:3000/api/mcp
```

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Project Structure

```
src/
├── index.ts          # Entry point — transport selection (stdio|http)
├── server.ts         # McpServer factory, registers all tools
├── github.ts         # GitHub REST API client
└── tools/            # Zod input schemas per tool
```
