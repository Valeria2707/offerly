import {
  createVacancyFingerprint,
  createVacancySourceHash,
  normalizeVacancySourceUrl
} from '../src/utils/vacancy.utils';
import { VacancyDraftData } from '../src/vacancy/vacancy.types';

describe('vacancy duplicate helpers', () => {
  const draft: VacancyDraftData = {
    title: 'Backend Engineer',
    company: 'Offerly',
    location: 'Warsaw',
    workFormat: 'Remote',
    employmentType: 'Full-time',
    level: 'Senior',
    salaryRange: null,
    postedAt: null,
    description: 'Build APIs',
    requiredSkills: ['NestJS', 'PostgreSQL'],
    preferredSkills: ['Kafka'],
    experienceRequirement: '5 years',
    educationRequirement: null,
    languageRequirements: ['English'],
    sourceUrl: null
  };

  it('normalizes equivalent URLs before comparison', () => {
    expect(
      normalizeVacancySourceUrl(
        'https://EXAMPLE.com/jobs/backend/?b=2&a=1#description'
      )
    ).toBe('https://example.com/jobs/backend?a=1&b=2');
  });

  it('creates the same source hash despite whitespace and letter case', () => {
    expect(createVacancySourceHash(' Senior   Backend Engineer ')).toBe(
      createVacancySourceHash('senior backend engineer')
    );
  });

  it('creates the same semantic fingerprint regardless of skill order', () => {
    expect(createVacancyFingerprint(draft)).toBe(
      createVacancyFingerprint({
        ...draft,
        requiredSkills: ['PostgreSQL', 'NestJS']
      })
    );
  });
});
