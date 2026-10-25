import Link from "next/link";
import { useTranslations } from "next-intl";

import type { AppNavItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function NavItem({
  item,
  pathname,
  badge,
}: {
  item: AppNavItem;
  pathname: string;
  badge?: number;
}) {
  const t = useTranslations("nav");
  const dot = (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", item.accent)}
    />
  );

  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
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
      {t(item.key)}
      {badge ? (
        <span className="ml-auto flex size-4.5 items-center justify-center rounded-full bg-terracotta font-mono text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
