export const cvProfileJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    basics: {
      type: 'object',
      additionalProperties: false,
      properties: {
        fullName: { type: ['string', 'null'] },
        headline: { type: ['string', 'null'] },
        email: { type: ['string', 'null'] },
        phone: { type: ['string', 'null'] },
        location: { type: ['string', 'null'] },
        summary: { type: ['string', 'null'] },
        links: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: { label: { type: 'string' }, url: { type: 'string' } },
            required: ['label', 'url']
          }
        }
      },
      required: ['fullName', 'headline', 'email', 'phone', 'location', 'summary', 'links']
    },
    preferences: {
      type: 'object',
      additionalProperties: false,
      properties: {
        desiredPosition: { type: ['string', 'null'] },
        level: { type: ['string', 'null'] },
        workFormat: { type: ['string', 'null'] },
        expectedSalary: { type: ['string', 'null'] }
      },
      required: ['desiredPosition', 'level', 'workFormat', 'expectedSalary']
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { name: { type: 'string' }, level: { type: ['string', 'null'] } },
        required: ['name', 'level']
      }
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          company: { type: 'string' }, title: { type: 'string' },
          startDate: { type: ['string', 'null'] }, endDate: { type: ['string', 'null'] },
          current: { type: 'boolean' }, location: { type: ['string', 'null'] },
          description: { type: ['string', 'null'] },
          highlights: { type: 'array', items: { type: 'string' } },
          skills: { type: 'array', items: { type: 'string' } }
        },
        required: ['company', 'title', 'startDate', 'endDate', 'current', 'location', 'description', 'highlights', 'skills']
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          institution: { type: 'string' }, degree: { type: ['string', 'null'] }, field: { type: ['string', 'null'] },
          startDate: { type: ['string', 'null'] }, endDate: { type: ['string', 'null'] }, description: { type: ['string', 'null'] }
        },
        required: ['institution', 'degree', 'field', 'startDate', 'endDate', 'description']
      }
    },
    projects: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          name: { type: 'string' }, description: { type: ['string', 'null'] }, url: { type: ['string', 'null'] },
          startDate: { type: ['string', 'null'] }, endDate: { type: ['string', 'null'] },
          highlights: { type: 'array', items: { type: 'string' } }, skills: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'description', 'url', 'startDate', 'endDate', 'highlights', 'skills']
      }
    },
    languages: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { name: { type: 'string' }, level: { type: ['string', 'null'] } },
        required: ['name', 'level']
      }
    }
  },
  required: ['basics', 'preferences', 'skills', 'experience', 'education', 'projects', 'languages']
};
