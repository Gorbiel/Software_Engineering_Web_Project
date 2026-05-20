export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
};

const ACCESS_TOKEN_KEY = "glazedin_access_token";
const REFRESH_TOKEN_KEY = "glazedin_refresh_token";
const USER_KEY = "glazedin_user";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return Promise.resolve(null);
  }
  return response.json();
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  if (
    "non_field_errors" in payload &&
    Array.isArray(payload.non_field_errors) &&
    typeof payload.non_field_errors[0] === "string"
  ) {
    return payload.non_field_errors[0];
  }

  const record = payload as Record<string, unknown>;
  for (const key of ["email", "password"]) {
    const value = record[key];
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return null;
}

function parseAuthUser(payload: unknown): AuthUser {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected user response.");
  }

  const record = payload as Record<string, unknown>;
  const id = record.id;
  const name = record.name;
  const email = record.email;

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof name !== "string" ||
    typeof email !== "string"
  ) {
    throw new Error("Unexpected user response.");
  }

  return { id, name, email };
}

function parseLoginResponse(payload: unknown): AuthSession {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected login response.");
  }

  const record = payload as Record<string, unknown>;
  const access = record.access;
  const refresh = record.refresh;
  const user = parseAuthUser(record.user);

  if (typeof access !== "string" || typeof refresh !== "string") {
    throw new Error("Unexpected login response.");
  }

  return { access, refresh, user };
}

const SESSION_COOKIE = "glazedin_session";

function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function saveSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  setSessionCookie();
}

export function saveUser(user: AuthUser) {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearSessionCookie();
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return parseAuthUser(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to read stored user.", error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSession> {
  const response = await fetch("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data) ?? "Unable to sign in.");
  }

  return parseLoginResponse(data);
}

export async function fetchMe(accessToken: string): Promise<AuthUser> {
  const response = await fetch("/api/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data) ?? "Session expired.");
  }

  return parseAuthUser(data);
}

export async function logoutRequest(
  refreshToken: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch("/api/auth/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data) ?? "Unable to log out.");
  }
}
