import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiCvParserService } from '../src/cv/openai-cv-parser.service';

describe('OpenAiCvParserService', () => {
  it('fails predictably when AI parsing is not configured', async () => {
    const service = new OpenAiCvParserService(new ConfigService({ OPENAI_API_KEY: '', OPENAI_MODEL: '' }));

    await expect(service.parse('A sufficiently long CV text')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('normalizes links without a protocol before validating the structured result', async () => {
    const service = new OpenAiCvParserService(new ConfigService({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'test-model' }));
    const result = {
      basics: { fullName: 'Jane Doe', headline: null, email: null, phone: null, location: null, summary: null, links: [{ label: 'LinkedIn', url: 'linkedin.com/in/jane' }] },
      preferences: { desiredPosition: null, level: null, workFormat: null, expectedSalary: null },
      skills: [],
      experience: [],
      education: [],
      projects: [{
        name: 'Offerly',
        description: 'Personal job search assistant',
        url: 'github.com/jane/offerly',
        startDate: '2025-01',
        endDate: null,
        highlights: ['Parsed CV data into a structured profile'],
        skills: ['NestJS', 'Next.js']
      }],
      languages: []
    };
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(result) }] }]
    }), { status: 200 }));

    await expect(service.parse('A sufficiently long CV text')).resolves.toMatchObject({
      basics: { links: [{ url: 'https://linkedin.com/in/jane' }] },
      projects: [{
        name: 'Offerly',
        url: 'https://github.com/jane/offerly',
        skills: ['NestJS', 'Next.js']
      }]
    });
    fetchSpy.mockRestore();
  });
});
