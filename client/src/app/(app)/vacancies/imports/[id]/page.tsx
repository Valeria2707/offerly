"use client";

import { use } from "react";

import { FormError } from "@/components/auth/form-error";
import { ImportReviewForm } from "@/components/vacancies/import-review-form";
import { ImportReviewSkeleton } from "@/components/vacancies/import-review-skeleton";
import { useVacancies, useVacancyImport } from "@/hooks/use-vacancies";

export default function VacancyImportReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: vacancyImport, isPending, error } = useVacancyImport(id);
  const { data: vacancies } = useVacancies();

  const duplicate = vacancies?.find(
    (vacancy) =>
      vacancyImport &&
      vacancy.title.trim().toLowerCase() ===
        vacancyImport.draft.title.trim().toLowerCase() &&
      vacancy.company.trim().toLowerCase() ===
        vacancyImport.draft.company.trim().toLowerCase(),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Перевірте розібрані дані
        </h1>
        <p className="text-sm text-muted-foreground">
          AI заповнив поля з оголошення — виправте те, що розпізнано неточно,
          перед додаванням
        </p>
      </header>

      <FormError error={error} />

      {isPending && <ImportReviewSkeleton />}

      {vacancyImport && (
        <ImportReviewForm
          key={vacancyImport.id}
          vacancyImport={vacancyImport}
          duplicate={duplicate}
        />
      )}
    </div>
  );
}
