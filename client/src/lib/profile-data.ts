import type { ProfileData } from "@/types/profile";

function nullifyEmptyStrings<T>(value: T): T {
  if (typeof value === "string") {
    return (value.trim() === "" ? null : value.trim()) as T;
  }

  if (Array.isArray(value)) {
    return value.map(nullifyEmptyStrings) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        nullifyEmptyStrings(item),
      ]),
    ) as T;
  }

  return value;
}

export function cleanProfileData(data: ProfileData): ProfileData {
  const clean = nullifyEmptyStrings(data);

  return {
    ...clean,
    basics: {
      ...clean.basics,
      links: clean.basics.links.filter((link) => link.label && link.url),
    },
    skills: clean.skills.filter((skill) => skill.name),
    experience: clean.experience
      .filter((item) => item.company && item.title)
      .map((item) => ({
        ...item,
        highlights: compactStrings(item.highlights),
        skills: compactStrings(item.skills),
      })),
    education: clean.education.filter((item) => item.institution),
    projects: clean.projects
      .filter((item) => item.name)
      .map((item) => ({
        ...item,
        highlights: compactStrings(item.highlights),
        skills: compactStrings(item.skills),
      })),
    languages: clean.languages.filter((item) => item.name),
  };
}

function compactStrings(list: string[]): string[] {
  return (list ?? []).filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
}

export function withBlankLink(data: ProfileData): ProfileData {
  if (data.basics.links.length > 0) return data;

  return {
    ...data,
    basics: { ...data.basics, links: [{ label: "", url: "" }] },
  };
}
