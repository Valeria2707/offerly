import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

function forgetTokenOnUnauthorized(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    useAuthStore.getState().clearAccessToken();
  }
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: forgetTokenOnUnauthorized }),
    mutationCache: new MutationCache({ onError: forgetTokenOnUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
