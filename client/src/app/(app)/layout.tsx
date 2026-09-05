"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { ROUTES } from "@/constants/routes";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { useAuthStore } from "@/stores/auth-store";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useIsHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (hydrated && !accessToken) router.replace(ROUTES.login);
  }, [hydrated, accessToken, router]);

  if (!hydrated || !accessToken) return null;

  return (
    <div className="flex min-h-full flex-1">
      <AppSidebar />
      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
