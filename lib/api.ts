export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://indexmyurl-backend.onrender.com";

/** An error from the API (or from reaching it). `status` is 0 when the server could not be reached. */
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function saveAuth(token: string, user: unknown) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again.";

async function request(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
}

async function failure(res: Response): Promise<ApiError> {
  const data = await res.json().catch(() => ({}));
  return new ApiError(
    data.message || `Request failed (${res.status})`,
    res.status,
    data.code,
  );
}

/**
 * POST and read a Server-Sent Events response (`data: <json>` frames) as it arrives,
 * calling `onEvent` for each one. EventSource cannot POST or send an Authorization
 * header, so this reads the fetch() body stream instead. Resolves when the server
 * closes the stream; aborting `signal` cancels it.
 */
export async function apiStream<T>(
  path: string,
  body: unknown,
  onEvent: (event: T) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = getToken();
  const res = await request(path, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  // validation / rate-limit / auth errors come back as a normal JSON response
  if (!res.ok || !res.body) throw await failure(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let end: number;
    while ((end = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data: ")) continue; // ": ping" keep-alives
        try {
          onEvent(JSON.parse(line.slice(6)) as T);
        } catch {
          /* ignore a malformed frame */
        }
      }
    }
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await request(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) throw await failure(res);
  return res.json();
}
