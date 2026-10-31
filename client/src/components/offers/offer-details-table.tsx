"use client";

import { useTranslations } from "next-intl";

import { StarRating } from "@/components/core/star-rating";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { OfferDetails, Vacancy } from "@/types/vacancy";

type OfferDetailsTableProps = {
  offers: Vacancy[];
  details: Record<string, OfferDetails>;
  disabled: boolean;
  onChange: (vacancyId: string, patch: Partial<OfferDetails>) => void;
};

export function OfferDetailsTable({
  offers,
  details,
  disabled,
  onChange,
}: OfferDetailsTableProps) {
  const t = useTranslations("offers");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr>
            <th className="w-40" />
            {offers.map((offer) => (
              <th key={offer.id} className="px-3 pb-3 text-left align-bottom">
                <span className="block font-semibold">{offer.company}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {offer.title}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <th className="py-3 pr-3 text-left font-medium">
              {t("criteria.salary")}
            </th>
            {offers.map((offer) => (
              <td key={offer.id} className="px-3 py-3">
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  disabled={disabled}
                  aria-label={`${t("criteria.salary")}: ${offer.company}`}
                  placeholder={t("salaryPlaceholder")}
                  value={details[offer.id].offerSalary ?? ""}
                  className={cn("h-9 w-32", FIELD_CLASS)}
                  onChange={(event) =>
                    onChange(offer.id, {
                      offerSalary: event.target.value
                        ? Math.round(Number(event.target.value))
                        : null,
                    })
                  }
                />
              </td>
            ))}
          </tr>
          {(["offerGrowth", "offerConditions"] as const).map((field) => {
            const label = t(
              field === "offerGrowth"
                ? "criteria.growth"
                : "criteria.conditions",
            );
            return (
              <tr key={field}>
                <th className="py-3 pr-3 text-left font-medium">
                  {label}
                  {field === "offerConditions" && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t("conditionsHint")}
                    </span>
                  )}
                </th>
                {offers.map((offer) => (
                  <td key={offer.id} className="px-3 py-3">
                    <StarRating
                      label={`${label}: ${offer.company}`}
                      value={details[offer.id][field]}
                      disabled={disabled}
                      onChange={(value) =>
                        onChange(offer.id, { [field]: value })
                      }
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
