import Link from "next/link";

import type { AppNavItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function NavItem({
  item,
  pathname,
}: {
  item: AppNavItem;
  pathname: string;
}) {
  const dot = (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", item.accent)}
    />
  );

  if (!item.href) {
    return (
      <span className="flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-subtle">
        {dot}
        {item.label}
      </span>
    );
  }

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
      {item.label}
    </Link>
  );
}
