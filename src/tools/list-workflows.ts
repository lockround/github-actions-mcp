import { z } from "zod/v4";

export const listWorkflowsSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  page: z.number().optional().default(1).describe("Page number"),
  per_page: z.number().optional().default(30).describe("Results per page (max 100)"),
});
