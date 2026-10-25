"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLocale, LOCALE_NAMES, LOCALES } from "@/constants/i18n";
import { setLocale } from "@/i18n/actions";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  side = "top",
  className,
}: {
  side?: "top" | "bottom";
  className?: string;
}) {
  const t = useTranslations("common");
  const current = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (value: unknown) => {
    const locale = String(value);
    if (!isLocale(locale) || locale === current) return;

    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language")}
        disabled={pending}
        className={cn(
          "flex h-9 items-center gap-2.5 px-3 text-sm text-subtle transition-colors outline-none hover:text-foreground focus-visible:text-foreground disabled:opacity-50",
          className,
        )}
      >
        <Globe aria-hidden className="size-4 shrink-0" />
        <span className="truncate">{LOCALE_NAMES[current]}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent side={side} align="start" className="min-w-40">
        <DropdownMenuRadioGroup value={current} onValueChange={change}>
          {LOCALES.map((locale) => (
            <DropdownMenuRadioItem
              key={locale}
              value={locale}
              lang={locale}
              className="data-checked:bg-secondary"
            >
              {LOCALE_NAMES[locale]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
