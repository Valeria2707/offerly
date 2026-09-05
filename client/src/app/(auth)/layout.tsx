import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { GuestOnly } from "@/components/auth/guest-only";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnly>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            href={ROUTES.home}
            aria-label="Offerly — на головну"
            className="mb-10 inline-flex text-muted-foreground transition-colors hover:text-foreground"
          >
            <Logo />
          </Link>

          {children}
        </div>
      </div>
    </GuestOnly>
  );
}
