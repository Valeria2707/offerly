import {
  API_BASE_URL,
  API_ERROR_MESSAGES,
  DEFAULT_API_ERROR_MESSAGE,
} from "@/constants/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
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

  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(
      API_ERROR_MESSAGES[response.status] ?? DEFAULT_API_ERROR_MESSAGE,
      response.status,
    );
  }

  return (text ? JSON.parse(text) : undefined) as T;
}
