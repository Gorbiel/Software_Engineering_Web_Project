import { getAccessToken, refreshSession } from "@/utils/auth";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return Promise.resolve(null);
  }
  return response.json();
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.detail === "string") {
    return record.detail;
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
    if (typeof value === "string") {
      return value;
    }
  }

  return fallback;
}

function withAuthHeaders(init: RequestInit): RequestInit {
  const token = getAccessToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return { ...init, headers };
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `/api${path}`;

  let response = await fetch(url, withAuthHeaders(init));

  if (response.status === 401 && (await refreshSession())) {
    response = await fetch(url, withAuthHeaders(init));
  }

  return response;
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(path, init);
  const data = await readJson(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data, "Request failed."),
      response.status,
      data,
    );
  }

  return data as T;
}
