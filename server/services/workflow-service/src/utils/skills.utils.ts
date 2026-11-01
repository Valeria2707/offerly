import { readRecords, readText, readTexts } from './record.utils';

export const normalizeSkill = (skill: string): string =>
  skill.toLowerCase().replace(/[\s._-]+/g, '');

export function profileSkills(profile: Record<string, unknown>): string[] {
  const names = [
    ...readRecords(profile.skills).map((skill) => readText(skill.name)),
    ...readRecords(profile.experience).flatMap((item) =>
      readTexts(item.skills)
    ),
    ...readRecords(profile.projects).flatMap((item) => readTexts(item.skills))
  ].filter((name): name is string => name !== null);
  return [
    ...new Map(names.map((name) => [normalizeSkill(name), name])).values()
  ];
}
