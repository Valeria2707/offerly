export const vacancyJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    company: { type: 'string' },
    location: { type: ['string', 'null'] },
    workFormat: { type: ['string', 'null'] },
    employmentType: { type: ['string', 'null'] },
    level: { type: ['string', 'null'] },
    salaryRange: { type: ['string', 'null'] },
    postedAt: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    requiredSkills: { type: 'array', items: { type: 'string' } },
    preferredSkills: { type: 'array', items: { type: 'string' } },
    experienceRequirement: { type: ['string', 'null'] },
    educationRequirement: { type: ['string', 'null'] },
    languageRequirements: { type: 'array', items: { type: 'string' } }
  },
  required: [
    'title',
    'company',
    'location',
    'workFormat',
    'employmentType',
    'level',
    'salaryRange',
    'postedAt',
    'description',
    'requiredSkills',
    'preferredSkills',
    'experienceRequirement',
    'educationRequirement',
    'languageRequirements'
  ]
};
