import { McpServer } from "@modelcontextprotocol/server";
import type { z } from "zod/v4";
import { GitHubClient } from "./github.js";

import {
  parseGithubRepo,
  parseGithubRepoSchema,
} from "./tools/parse-repo.js";
import { listWorkflowsSchema } from "./tools/list-workflows.js";
import { getWorkflowSchema } from "./tools/get-workflow.js";
import { triggerWorkflowSchema } from "./tools/trigger-workflow.js";
import { getWorkflowRunSchema } from "./tools/get-workflow-run.js";
import { cancelWorkflowRunSchema } from "./tools/cancel-workflow-run.js";
import { triggerRepositoryDispatchSchema } from "./tools/trigger-repository-dispatch.js";

function getClient(): GitHubClient {
  return new GitHubClient();
}

export function createGitHubActionsServer(): McpServer {
  const server = new McpServer({
    name: "github-actions",
    version: "1.0.0",
  });

  // 1. parse-github-repo
  server.registerTool(
    "parse-github-repo",
    {
      description:
        'Parse a GitHub URL or "owner/repo" string into structured owner and repo fields.',
      inputSchema: parseGithubRepoSchema,
    },
    (input) => {
      try {
        const { owner, repo } = parseGithubRepo(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ owner, repo }),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 2. list-workflows
  server.registerTool(
    "list-workflows",
    {
      description: "List all GitHub Actions workflows for a repository.",
      inputSchema: listWorkflowsSchema,
    },
    async ({ owner, repo, page, per_page }) => {
      try {
        const gh = getClient();
        const result = await gh.listWorkflows(owner, repo, page, per_page);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 3. get-workflow
  server.registerTool(
    "get-workflow",
    {
      description:
        "Get details of a specific GitHub Actions workflow by ID or filename.",
      inputSchema: getWorkflowSchema,
    },
    async ({ owner, repo, workflow_id }) => {
      try {
        const gh = getClient();
        const result = await gh.getWorkflow(owner, repo, workflow_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 4. trigger-workflow
  server.registerTool(
    "trigger-workflow",
    {
      description:
        "Trigger a GitHub Actions workflow via workflow_dispatch event.",
      inputSchema: triggerWorkflowSchema,
    },
    async ({ owner, repo, workflow_id, ref, inputs }) => {
      try {
        const gh = getClient();
        await gh.triggerWorkflowDispatch(
          owner,
          repo,
          workflow_id,
          ref,
          inputs,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Workflow ${workflow_id} triggered on ${ref}`,
                inputs,
              }),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 5. get-workflow-run
  server.registerTool(
    "get-workflow-run",
    {
      description:
        "Get the latest or a specific GitHub Actions workflow run status.",
      inputSchema: getWorkflowRunSchema,
    },
    async ({ owner, repo, run_id, workflow_id, status }) => {
      try {
        const gh = getClient();
        if (run_id) {
          const result = await gh.getWorkflowRun(owner, repo, run_id);
          return {
            content: [
              { type: "text", text: JSON.stringify(result, null, 2) },
            ],
          };
        }
        const result = await gh.listWorkflowRuns(owner, repo, {
          workflowId: workflow_id,
          status,
          perPage: 1,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 6. cancel-workflow-run
  server.registerTool(
    "cancel-workflow-run",
    {
      description: "Cancel a running GitHub Actions workflow.",
      inputSchema: cancelWorkflowRunSchema,
      annotations: { destructiveHint: true },
    },
    async ({ owner, repo, run_id }) => {
      try {
        const gh = getClient();
        await gh.cancelWorkflowRun(owner, repo, run_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Workflow run ${run_id} cancelled`,
              }),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  // 7. trigger-repository-dispatch
  server.registerTool(
    "trigger-repository-dispatch",
    {
      description:
        "Trigger a repository_dispatch event to start a workflow.",
      inputSchema: triggerRepositoryDispatchSchema,
    },
    async ({ owner, repo, event_type, client_payload }) => {
      try {
        const gh = getClient();
        await gh.triggerRepositoryDispatch(
          owner,
          repo,
          event_type,
          client_payload,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Repository dispatch "${event_type}" triggered`,
                client_payload,
              }),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  return server;
}
