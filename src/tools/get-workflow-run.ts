import { z } from "zod/v4";

export const getWorkflowRunSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  run_id: z
    .number()
    .optional()
    .describe("Specific run ID. If omitted, returns the latest run."),
  workflow_id: z
    .string()
    .optional()
    .describe("Filter by workflow ID when fetching latest run"),
  status: z
    .enum([
      "completed",
      "action_required",
      "cancelled",
      "failure",
      "neutral",
      "skipped",
      "stale",
      "success",
      "timed_out",
      "in_progress",
      "queued",
      "requested",
      "waiting",
      "pending",
    ])
    .optional()
    .describe("Filter runs by status"),
});
