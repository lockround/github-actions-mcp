import { z } from "zod/v4";

export const cancelWorkflowRunSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  run_id: z.number().describe("The workflow run ID to cancel"),
});
