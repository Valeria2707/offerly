import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Logo } from "@/components/brand/logo";
import { GuestOnly } from "@/components/auth/guest-only";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("common");

  return (
    <GuestOnly>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href={ROUTES.home}
              aria-label={t("homeLink")}
              className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
            >
              <Logo />
            </Link>
            <LanguageSwitcher side="bottom" />
          </div>

          {children}
        </div>
      </div>
    </GuestOnly>
  );
}
