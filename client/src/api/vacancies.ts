import { VACANCY_API_BASE_URL, VACANCY_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  Vacancy,
  VacancyDraft,
  VacancyImport,
  VacancyPatch,
} from "@/types/vacancy";
import type { CriteriaComparisons, OfferRecommendation } from "@/types/offer";

const withVacancyService = { baseUrl: VACANCY_API_BASE_URL };

export const vacanciesRequest = () =>
  apiRequest<Vacancy[]>(VACANCY_ROUTES.vacancies, {
    ...withVacancyService,
  });

export const vacancyRequest = (vacancyId: string) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
  });

export const vacancyImportRequest = (importId: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.vacancyImport(importId), {
    ...withVacancyService,
  });

export const importVacancyUrlRequest = (url: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.importUrl, {
    ...withVacancyService,
    method: "POST",
    body: { url },
  });

export const importVacancyTextRequest = (text: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.importText, {
    ...withVacancyService,
    method: "POST",
    body: { text },
  });

export const applyVacancyImportRequest = (
  importId: string,
  draft: VacancyDraft,
) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.applyImport(importId), {
    ...withVacancyService,
    method: "POST",
    body: { draft },
  });

export const updateVacancyRequest = (vacancyId: string, patch: VacancyPatch) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
    method: "PATCH",
    body: patch,
  });

export const deleteVacancyRequest = (vacancyId: string) =>
  apiRequest<void>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
    method: "DELETE",
  });

export const offerRecommendationRequest = (
  vacancyIds: string[],
  comparisons: CriteriaComparisons,
) =>
  apiRequest<OfferRecommendation>(VACANCY_ROUTES.offerRecommendation, {
    ...withVacancyService,
    method: "POST",
    body: { vacancyIds, comparisons },
  });
