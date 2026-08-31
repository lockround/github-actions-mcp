import { z } from "zod/v4";

export const triggerWorkflowSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  workflow_id: z
    .string()
    .describe("Workflow ID (number) or filename (e.g. ci.yml)"),
  ref: z.string().describe("Branch or tag ref to run the workflow on"),
  inputs: z
    .record(z.string(), z.string())
    .optional()
    .describe("Key-value inputs configured in the workflow_dispatch event"),
});
