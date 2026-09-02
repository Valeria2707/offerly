import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

function endSessionOnUnauthorized(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    useAuthStore.getState().clearSession();
  }
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: endSessionOnUnauthorized }),
    mutationCache: new MutationCache({ onError: endSessionOnUnauthorized }),
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
