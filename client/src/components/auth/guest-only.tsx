"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { useAuthStore } from "@/stores/auth-store";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useIsHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authenticated = hydrated && Boolean(accessToken);

  useEffect(() => {
    if (authenticated) router.replace(ROUTES.dashboard);
  }, [authenticated, router]);

  if (!hydrated || accessToken) return null;

  return <>{children}</>;
}
