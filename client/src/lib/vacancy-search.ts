import type { Vacancy } from "@/types/vacancy";

const normalize = (value: string | null) =>
  value?.replace(/\s+/g, " ").trim().toLowerCase() || null;

export function filterVacancies(vacancies: Vacancy[], query: string) {
  const needle = normalize(query);
  if (!needle) return vacancies;

  return vacancies.filter((vacancy) =>
    [vacancy.title, vacancy.company, vacancy.location, vacancy.sourceUrl]
      .map(normalize)
      .some((value) => value?.includes(needle)),
  );
}
