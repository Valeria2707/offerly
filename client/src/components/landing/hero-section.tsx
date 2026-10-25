import Link from "next/link";
import { useTranslations } from "next-intl";

import { ApplicationPreview } from "@/components/landing/application-preview";
import { Container } from "@/components/landing/container";
import { buttonVariants } from "@/components/ui/button";
import { HERO_STATS } from "@/constants/landing";
import { ROUTES, sectionHref } from "@/constants/routes";

export function HeroSection() {
  const t = useTranslations("landing");

  return (
    <section className="border-b border-border py-20 lg:py-28">
      <Container className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl leading-[1.12] font-bold tracking-tight text-balance sm:text-[2.75rem]">
            {t("hero.title")}
          </h1>

          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ROUTES.signup}
              className={buttonVariants({ size: "lg", className: "px-5" })}
            >
              {t("start")}
            </Link>
            <Link
              href={sectionHref("howItWorks")}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "px-5",
              })}
            >
              {t("nav.howItWorks")}
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.key}>
                <dt className="sr-only">{t(`hero.stats.${stat.key}`)}</dt>
                <dd>
                  <span className="block text-2xl font-semibold">
                    {stat.value}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-subtle">
                    {t(`hero.stats.${stat.key}`)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ApplicationPreview />
      </Container>
    </section>
  );
}
