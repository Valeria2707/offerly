"use client";

import { ChevronLeft, Loader2, Scale } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Skeleton } from "@/components/core/skeleton";
import { CriteriaComparisons } from "@/components/offers/criteria-comparisons";
import { OfferDetailsTable } from "@/components/offers/offer-details-table";
import { OfferResult } from "@/components/offers/offer-result";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useCompareOffers } from "@/hooks/use-offers";
import { useVacancies } from "@/hooks/use-vacancies";
import { useWorkflowSummaries } from "@/hooks/use-workflow";
import { EQUAL_COMPARISONS, offerVacancies } from "@/lib/offers";
import type { CriteriaComparisons as Comparisons } from "@/types/offer";
import type { OfferDetails } from "@/types/vacancy";

export default function OffersPage() {
  const t = useTranslations("offers");
  const errorMessage = useErrorMessage();
  const { data: vacancies, isPending, error } = useVacancies();
  const { data: summaries, isPending: isSummaryPending } = useWorkflowSummaries(
    (vacancies ?? []).map((vacancy) => vacancy.id),
  );
  const compare = useCompareOffers();

  const [edits, setEdits] = useState<Record<string, Partial<OfferDetails>>>({});
  const [comparisons, setComparisons] =
    useState<Comparisons>(EQUAL_COMPARISONS);

  const offers = offerVacancies(vacancies ?? [], summaries);
  const details = Object.fromEntries(
    offers.map((offer) => [
      offer.id,
      {
        offerSalary: offer.offerSalary,
        offerGrowth: offer.offerGrowth,
        offerConditions: offer.offerConditions,
        ...edits[offer.id],
      },
    ]),
  );
  const isComplete = offers.every((offer) =>
    Object.values(details[offer.id]).every((value) => value !== null),
  );

  const change = (vacancyId: string, patch: Partial<OfferDetails>) => {
    compare.reset();
    setEdits((current) => ({
      ...current,
      [vacancyId]: { ...current[vacancyId], ...patch },
    }));
  };
  const changeComparisons = (value: Comparisons) => {
    compare.reset();
    setComparisons(value);
  };

  const run = (answers: Comparisons = comparisons) =>
    compare.mutate(
      {
        offers: offers.map((offer) => ({
          vacancyId: offer.id,
          details: details[offer.id],
        })),
        comparisons: answers,
      },
      {
        onError: (cause) =>
          toast.error(errorMessage(cause), { id: "offers-error" }),
      },
    );

  const loading = isPending || (offers.length === 0 && isSummaryPending);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <Link
        href={ROUTES.vacancies}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("back")}
      </Link>

      <header className="grid gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <FormError error={error} />

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : offers.length < 2 ? (
        <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          {t("notEnough")}
        </p>
      ) : (
        <>
          <section className="grid gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="font-heading text-base font-semibold">
              {t("step1")}
            </h2>
            <OfferDetailsTable
              offers={offers}
              details={details}
              disabled={compare.isPending}
              onChange={change}
            />
          </section>

          <section className="grid gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="font-heading text-base font-semibold">
              {t("step2")}
            </h2>
            <CriteriaComparisons
              value={comparisons}
              disabled={compare.isPending}
              onChange={changeComparisons}
            />
          </section>

          <div className="flex items-center gap-3">
            <Button
              disabled={!isComplete || compare.isPending}
              onClick={() => run()}
            >
              {compare.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Scale />
              )}
              {t("compare")}
            </Button>
            {!isComplete && (
              <span className="text-xs text-muted-foreground">
                {t("fillAll")}
              </span>
            )}
          </div>

          {compare.data && (
            <OfferResult
              result={compare.data}
              comparisons={compare.variables?.comparisons ?? comparisons}
              offers={offers}
              onApplySuggestions={(changes) => {
                const answers = changes.reduce(
                  (current, change) => ({
                    ...current,
                    [change.comparison]: change.value,
                  }),
                  comparisons,
                );
                setComparisons(answers);
                run(answers);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
