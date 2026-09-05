"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/brand/logo";
import { APP_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn, initials } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between bg-sidebar px-3 py-6">
      <div>
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2.5 px-2"
          aria-label="Offerly — на дешборд"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LogoMark className="size-4" />
          </span>
          <span className="grid">
            <span className="text-sm font-semibold">Offerly</span>
            <span className="font-mono text-[10px] text-subtle">
              AI-асистент
            </span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-1">
          {APP_NAV_ITEMS.map((item) => {
            const active = Boolean(item.href) && pathname === item.href;
            const dot = (
              <span
                aria-hidden
                className={cn("size-1.5 shrink-0 rounded-full", item.accent)}
              />
            );

            if (!item.href) {
              return (
                <span
                  key={item.label}
                  className="flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-subtle"
                >
                  {dot}
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-subtle hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                {dot}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 flex items-center gap-2.5 border-t border-sidebar-border px-2 pt-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
          {initials(user?.name)}
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-sm font-medium">{user?.name}</span>
          <span className="truncate font-mono text-[10px] text-subtle">
            {user?.email}
          </span>
        </span>
        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="shrink-0 text-xs text-subtle transition-colors hover:text-foreground disabled:opacity-50"
        >
          Вийти
        </button>
      </div>
    </aside>
  );
}
