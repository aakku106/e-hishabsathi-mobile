import { ENV } from "./env";

const DEFAULT_TIMEOUT_MS = 15_000;

export const API = {
  baseUrl: ENV.apiBaseUrl,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
    },
    businesses: "/businesses",
    sales: "/sales",
    purchases: "/purchases",
    udharo: "/udharo",
    sync: "/sync",
  },
} as const;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API.timeoutMs);

  try {
    const response = await fetch(`${API.baseUrl}${path}`, {
      ...options,
      headers: { ...API.headers, ...options.headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
