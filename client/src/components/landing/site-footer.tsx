import { useTranslations } from "next-intl";

import { Container } from "@/components/landing/container";

export function SiteFooter() {
  const t = useTranslations("common");

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-wrap items-center justify-between gap-2 py-6 font-mono text-xs text-subtle">
        <span>Offerly · {t("tagline")}</span>
        <span>© 2026</span>
      </Container>
    </footer>
  );
}
