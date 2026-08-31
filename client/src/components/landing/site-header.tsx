import Link from "next/link";

import { Container } from "@/components/landing/container";
import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/constants/landing";
import { ROUTES } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center gap-8">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2.5 font-medium"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            К
          </span>
          Кар’єра
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-[width] duration-300 ease-out group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
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
        </div>
      </Container>
    </header>
  );
}
