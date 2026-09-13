import { VacancyLifecycle } from '../src/vacancy/enums/vacancy-lifecycle.enum';
import { VacancyDraftData } from '../src/vacancy/vacancy.types';
import { resolveVacancyImportDraft } from '../src/utils/vacancy.utils';

describe('resolveVacancyImportDraft', () => {
  const original: VacancyDraftData = {
    title: 'Backend Engineer',
    company: 'Offerly',
    location: null,
    workFormat: 'Remote',
    employmentType: null,
    level: null,
    salaryRange: null,
    postedAt: null,
    description: 'Original description',
    requiredSkills: ['NestJS'],
    preferredSkills: [],
    experienceRequirement: null,
    educationRequirement: null,
    languageRequirements: [],
    sourceUrl: 'https://example.com/jobs/1'
  };

  it('uses the stored AI draft when no edited draft is supplied', () => {
    expect(resolveVacancyImportDraft(original)).toEqual({
      ...original,
      lifecycle: VacancyLifecycle.ACTIVE
    });
  });

  it('uses edited fields while preserving the imported source URL', () => {
    expect(
      resolveVacancyImportDraft(original, {
        title: 'Senior Backend Engineer',
        company: 'Offerly'
      })
    ).toMatchObject({
      title: 'Senior Backend Engineer',
      sourceUrl: original.sourceUrl,
      lifecycle: VacancyLifecycle.ACTIVE
    });
  });
});
