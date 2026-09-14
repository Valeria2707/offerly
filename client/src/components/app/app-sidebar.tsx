"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/components/app/nav-item";
import { LogoMark } from "@/components/brand/logo";
import { APP_NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";

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

        <nav className="mt-8 grid gap-5">
          {APP_NAV_SECTIONS.map((section, index) => (
            <div key={section.title ?? index} className="grid gap-1">
              {section.title && (
                <h2 className="px-3 pb-1 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
                  {section.title}
                </h2>
              )}

              {section.items.map((item) => (
                <NavItem key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
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
