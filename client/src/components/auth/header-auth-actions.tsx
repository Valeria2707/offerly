"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { useAuthStore } from "@/stores/auth-store";

export function HeaderAuthActions() {
  const hydrated = useIsHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  if (!hydrated || (accessToken && !user)) {
    return <div className="h-9 w-44" aria-hidden />;
  }

  if (!user) {
    return (
      <>
        <Link
          href={ROUTES.login}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Увійти
        </Link>
        <Link
          href={ROUTES.signup}
          className={buttonVariants({ className: "px-4" })}
        >
          Почати
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user.name}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Вийти
      </Button>
    </>
  );
}
