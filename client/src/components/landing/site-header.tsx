import Link from "next/link";

import { HeaderAuthActions } from "@/components/auth/header-auth-actions";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/landing/container";
import { NAV_LINKS } from "@/constants/landing";
import { ROUTES } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center gap-8">
        <Link href={ROUTES.home} aria-label="Offerly — на головну">
          <Logo />
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
          <HeaderAuthActions />
        </div>
      </Container>
    </header>
  );
}
