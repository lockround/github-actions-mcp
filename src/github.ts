const BASE_URL = "https://api.github.com";

export class GitHubClient {
  private token: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    this.token = token;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    const url = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${this.token}`,
    };

    const init: RequestInit = { method, headers };
    if (body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = (data as any)?.message ?? res.statusText;
      throw new Error(`GitHub API ${res.status}: ${msg}`);
    }

    return data;
  }

  async listWorkflows(owner: string, repo: string, page = 1, perPage = 30) {
    return this.request(
      "GET",
      `/repos/${owner}/${repo}/actions/workflows?page=${page}&per_page=${perPage}`,
    );
  }

  async getWorkflow(owner: string, repo: string, workflowId: string) {
    return this.request(
      "GET",
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}`,
    );
  }

  async triggerWorkflowDispatch(
    owner: string,
    repo: string,
    workflowId: string,
    ref: string,
    inputs?: Record<string, string>,
  ) {
    return this.request(
      "POST",
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      { ref, inputs },
    );
  }

  async listWorkflowRuns(
    owner: string,
    repo: string,
    options?: { workflowId?: string; status?: string; perPage?: number },
  ) {
    const params = new URLSearchParams();
    if (options?.workflowId) {
      // use the per-workflow endpoint
      const qs = options.status ? `&status=${options.status}` : "";
      const pp = options.perPage ? `&per_page=${options.perPage}` : "";
      return this.request(
        "GET",
        `/repos/${owner}/${repo}/actions/workflows/${options.workflowId}/runs?${qs}${pp}`,
      );
    }
    if (options?.status) params.set("status", options.status);
    if (options?.perPage) params.set("per_page", String(options.perPage));
    const qs = params.toString() ? `?${params}` : "";
    return this.request("GET", `/repos/${owner}/${repo}/actions/runs${qs}`);
  }

  async getWorkflowRun(owner: string, repo: string, runId: number) {
    return this.request(
      "GET",
      `/repos/${owner}/${repo}/actions/runs/${runId}`,
    );
  }

  async cancelWorkflowRun(owner: string, repo: string, runId: number) {
    return this.request(
      "POST",
      `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
    );
  }

  async triggerRepositoryDispatch(
    owner: string,
    repo: string,
    eventType: string,
    clientPayload?: Record<string, unknown>,
  ) {
    return this.request(
      "POST",
      `/repos/${owner}/${repo}/dispatches`,
      { event_type: eventType, client_payload: clientPayload },
    );
  }
}
