import { useTranslations } from "next-intl";

import { Container } from "@/components/landing/container";
import { HOW_IT_WORKS_STEPS } from "@/constants/landing";
import { SECTIONS } from "@/constants/routes";

export function HowItWorksSection() {
  const t = useTranslations("landing");

  return (
    <section
      id={SECTIONS.howItWorks}
      className="scroll-mt-16 border-b border-border bg-muted py-20"
    >
      <Container>
        <h2 className="text-center font-heading text-2xl font-bold tracking-tight">
          {t("nav.howItWorks")}
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step}>
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-medium">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`steps.${step}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
