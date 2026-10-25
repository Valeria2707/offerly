import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { ROUTES } from "@/constants/routes";
import { profileProgress } from "@/lib/dashboard";
import type { ProfileData } from "@/types/profile";

export function ProfileProgress({ data }: { data: ProfileData }) {
  const t = useTranslations("dashboard.profile");
  const list = new Intl.ListFormat(useLocale(), { type: "conjunction" });
  const { percent, missing } = profileProgress(data);

  return (
    <section className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <header className="flex items-center justify-between">
        <h2 className="font-heading text-base font-bold">{t("title")}</h2>
        <span className="text-sm font-semibold">{percent}%</span>
      </header>

      <div
        role="progressbar"
        aria-label={t("progressLabel")}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {missing.length ? (
          <>
            {t("add", {
              sections: list.format(
                missing.map((key) => t(`sections.${key}`)),
              ),
            })}{" "}
            —{" "}
            <Link href={ROUTES.profile} className="text-primary hover:underline">
              {t("link")}
            </Link>
          </>
        ) : (
          t("complete")
        )}
      </p>
    </section>
  );
}
