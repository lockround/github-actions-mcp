import { z } from "zod/v4";

export const getWorkflowSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  workflow_id: z
    .string()
    .describe("Workflow ID (number) or filename (e.g. ci.yml)"),
});
