import { VACANCY_API_BASE_URL, VACANCY_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  Vacancy,
  VacancyDraft,
  VacancyImport,
  VacancyPatch,
} from "@/types/vacancy";

const withVacancyService = { baseUrl: VACANCY_API_BASE_URL };

export const vacanciesRequest = (token: string) =>
  apiRequest<Vacancy[]>(VACANCY_ROUTES.vacancies, {
    ...withVacancyService,
    token,
  });

export const vacancyRequest = (token: string, vacancyId: string) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
    token,
  });

export const vacancyImportRequest = (token: string, importId: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.vacancyImport(importId), {
    ...withVacancyService,
    token,
  });

export const importVacancyUrlRequest = (token: string, url: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.importUrl, {
    ...withVacancyService,
    method: "POST",
    body: { url },
    token,
  });

export const importVacancyTextRequest = (token: string, text: string) =>
  apiRequest<VacancyImport>(VACANCY_ROUTES.importText, {
    ...withVacancyService,
    method: "POST",
    body: { text },
    token,
  });

export const applyVacancyImportRequest = (
  token: string,
  importId: string,
  draft: VacancyDraft,
) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.applyImport(importId), {
    ...withVacancyService,
    method: "POST",
    body: { draft },
    token,
  });

export const updateVacancyRequest = (
  token: string,
  vacancyId: string,
  patch: VacancyPatch,
) =>
  apiRequest<Vacancy>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
    method: "PATCH",
    body: patch,
    token,
  });

export const deleteVacancyRequest = (token: string, vacancyId: string) =>
  apiRequest<void>(VACANCY_ROUTES.vacancy(vacancyId), {
    ...withVacancyService,
    method: "DELETE",
    token,
  });
