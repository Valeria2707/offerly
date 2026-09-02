import {
  API_BASE_URL,
  API_ERROR_MESSAGES,
  API_ROUTES,
  DEFAULT_API_ERROR_MESSAGE,
} from "@/constants/api";
import { getRefreshToken, useAuthStore } from "@/stores/auth-store";
import type { AuthTokens } from "@/types/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

async function send(
  path: string,
  method: HttpMethod,
  body: unknown,
  token: string | null | undefined,
): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(DEFAULT_API_ERROR_MESSAGE, 0);
  }
}

let refreshInFlight: Promise<string | null> | null = null;

function refreshSession(): Promise<string | null> {
  refreshInFlight ??= (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      const response = await send(
        API_ROUTES.refresh,
        "POST",
        { refreshToken },
        null,
      );

      if (!response.ok) {
        useAuthStore.getState().clearSession();
        return null;
      }

      const tokens = (await response.json()) as AuthTokens;
      useAuthStore.getState().setSession(tokens);
      return tokens.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  let response = await send(path, method, body, token);

  if (response.status === 401 && token) {
    const refreshed = await refreshSession();
    if (refreshed) response = await send(path, method, body, refreshed);
  }

  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(
      API_ERROR_MESSAGES[response.status] ?? DEFAULT_API_ERROR_MESSAGE,
      response.status,
    );
  }

  return (text ? JSON.parse(text) : undefined) as T;
}
