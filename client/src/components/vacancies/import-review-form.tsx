"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { TagListField } from "@/components/core/tag-list-field";
import { TextField } from "@/components/core/text-field";
import { TextareaField } from "@/components/core/textarea-field";
import { ReviewCard } from "@/components/vacancies/review-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useApplyVacancyImport, useUpdateVacancy } from "@/hooks/use-vacancies";
import { toVacancyDraft } from "@/lib/vacancy-data";
import type { Vacancy, VacancyDraft, VacancyImport } from "@/types/vacancy";

type ImportReviewFormProps = {
  vacancyImport: VacancyImport;
  duplicate?: Vacancy;
};

export function ImportReviewForm({
  vacancyImport,
  duplicate,
}: ImportReviewFormProps) {
  const router = useRouter();
  const form = useForm<VacancyDraft>({ defaultValues: vacancyImport.draft });
  const applyImport = useApplyVacancyImport();
  const updateVacancy = useUpdateVacancy();

  const {
    register,
    formState: { errors },
  } = form;

  const pending = applyImport.isPending || updateVacancy.isPending;
  const error = applyImport.error ?? updateVacancy.error;

  const onSubmit = form.handleSubmit((values) => {
    const draft = toVacancyDraft(values);
    const options = {
      onSuccess: () => {
        toast.success(duplicate ? "Вакансію оновлено" : "Вакансію додано");
        router.push(ROUTES.vacancies);
      },
    };

    if (duplicate) {
      updateVacancy.mutate({ vacancyId: duplicate.id, draft }, options);
      return;
    }

    applyImport.mutate({ importId: vacancyImport.id, draft }, options);
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="grid gap-6">
        {duplicate && (
          <p className="flex flex-wrap gap-x-3 gap-y-1 rounded-xl bg-warning-muted px-4 py-3 text-sm text-warning">
            <span className="font-mono text-[10px] leading-5 tracking-wider uppercase">
              Дублікат
            </span>
            <span className="min-w-0 flex-1">
              Схожа вакансія вже додана — «{duplicate.title} ·{" "}
              {duplicate.company}». Збереження оновить її, а не створить другий
              запис про ту саму позицію.
            </span>
          </p>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-6">
            <ReviewCard title="Розібрані дані" path="vacancy">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-1">
                  <TextField
                    id="title"
                    label="Position"
                    aria-invalid={Boolean(errors.title)}
                    {...register("title", { required: true })}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">Вкажіть посаду</p>
                  )}
                </div>

                <div className="grid gap-1">
                  <TextField
                    id="company"
                    label="Company"
                    aria-invalid={Boolean(errors.company)}
                    {...register("company", { required: true })}
                  />
                  {errors.company && (
                    <p className="text-xs text-destructive">Вкажіть компанію</p>
                  )}
                </div>

                <TextField
                  id="location"
                  label="Location"
                  {...register("location")}
                />
                <TextField
                  id="workFormat"
                  label="Work format"
                  {...register("workFormat")}
                />
                <TextField id="level" label="Level" {...register("level")} />
                <TextField
                  id="employmentType"
                  label="Employment type"
                  {...register("employmentType")}
                />
                <TextField
                  id="salaryRange"
                  label="Salary range"
                  {...register("salaryRange")}
                />
                {/* type=date гарантує YYYY-MM-DD, якого чекає бекенд. */}
                <TextField
                  id="postedAt"
                  label="Posted"
                  type="date"
                  {...register("postedAt")}
                />
              </div>

              <TextField
                id="sourceUrl"
                label="Source URL"
                type="url"
                {...register("sourceUrl")}
              />

              <TextareaField
                id="description"
                label="Description"
                rows={8}
                {...register("description")}
              />
            </ReviewCard>

            <ReviewCard title="Витягнуті вимоги" path="requirements">
              <TagListField name="requiredSkills" label="Required skills" />
              <TagListField name="preferredSkills" label="Preferred skills" />

              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  id="experienceRequirement"
                  label="Experience"
                  {...register("experienceRequirement")}
                />
                <TextField
                  id="educationRequirement"
                  label="Education"
                  {...register("educationRequirement")}
                />
              </div>

              <TagListField
                name="languageRequirements"
                label="Language requirements"
              />
            </ReviewCard>
          </div>

          <div className="grid content-start gap-4">
            {vacancyImport.sourceUrl && (
              <ReviewCard title="Джерело" path="source">
                <a
                  href={vacancyImport.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm break-all text-primary hover:underline"
                >
                  {vacancyImport.sourceUrl}
                </a>
              </ReviewCard>
            )}

            <FormError error={error} />

            <Button type="submit" size="lg" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {duplicate ? "Оновити вакансію" : "Додати вакансію"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push(ROUTES.vacancies)}
            >
              Скасувати
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
