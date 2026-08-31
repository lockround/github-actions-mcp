import { z } from "zod/v4";

export const triggerRepositoryDispatchSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  event_type: z
    .string()
    .describe(
      "Event type identifier (must match the on.repository_dispatch.types in the workflow file)",
    ),
  client_payload: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("JSON payload to pass to the workflow"),
});
