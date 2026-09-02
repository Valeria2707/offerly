import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthTokens } from "@/types/auth";

type Session = Pick<AuthTokens, "accessToken" | "refreshToken">;

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (tokens: Session) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setSession: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      clearSession: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: "offerly-auth",
      partialize: ({ accessToken, refreshToken }) => ({
        accessToken,
        refreshToken,
      }),
    },
  ),
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
