import { z } from "zod/v4";

export const parseGithubRepoSchema = z.object({
  url_or_repo: z
    .string()
    .describe(
      'GitHub URL (e.g. https://github.com/owner/repo) or "owner/repo" string',
    ),
});

export type ParseGithubRepoInput = z.infer<typeof parseGithubRepoSchema>;

export function parseGithubRepo(input: ParseGithubRepoInput): {
  owner: string;
  repo: string;
} {
  const raw = input.url_or_repo.trim();

  // Full URL: https://github.com/owner/repo or https://github.com/owner/repo.git
  const urlMatch = raw.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?(?:\/.*)?$/,
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // owner/repo format
  const parts = raw.split("/");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  }

  throw new Error(
    `Invalid GitHub repo format: "${raw}". Use "owner/repo" or a full GitHub URL.`,
  );
}
