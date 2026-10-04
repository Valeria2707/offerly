import { PreparationContext } from '../src/preparation/preparation.types';
import {
  customPrompt,
  cvPrompt,
  hrPrompt,
  technicalPrompt
} from '../src/preparation/prompts/preparation-prompts';
import { analyzeStack } from '../src/utils/preparation.utils';

const context = (
  code: string | null,
  name = 'Stage',
  instructions = 'Prepare'
): PreparationContext => ({
  stage: { name, category: 'technical', code },
  instructions,
  vacancy: {
    title: 'Frontend Developer',
    company: 'Acme',
    level: 'Middle',
    requiredSkills: ['React', 'TypeScript', 'GraphQL'],
    preferredSkills: ['Next.js', 'Docker'],
    experienceRequirement: '3+ years'
  },
  profile: {
    skills: [{ name: 'react', level: 'advanced' }],
    experience: [{ skills: ['Type Script', 'Redux'] }],
    projects: [{ skills: ['Next.js'] }]
  }
});

describe('analyzeStack', () => {
  it('finds matched skills and required gaps across skills, jobs and projects', () => {
    const stack = analyzeStack(context('technical_interview'));
    expect(stack.matchedSkills).toEqual(['React', 'TypeScript', 'Next.js']);
    expect(stack.missingRequiredSkills).toEqual(['GraphQL']);
    expect(stack.level).toBe('Middle');
  });

  it('tolerates an empty profile and vacancy', () => {
    const stack = analyzeStack({
      ...context(null),
      vacancy: {},
      profile: {}
    });
    expect(stack.role).toBe('the role');
    expect(stack.missingRequiredSkills).toEqual([]);
  });
});

describe('stage prompts', () => {
  it('passes the vacancy stack and gaps into every prompt', () => {
    for (const prompt of [
      cvPrompt(context('submitted')),
      hrPrompt(context('hr_screening')),
      technicalPrompt(context('technical_interview')),
      customPrompt(context('offer'))
    ]) {
      expect(prompt).toContain('Required stack: React, TypeScript, GraphQL');
      expect(prompt).toContain('(main gaps): GraphQL');
      expect(prompt).toContain('Frontend Developer at Acme');
    }
  });

  it('adapts technical prompts to the exact stage', () => {
    expect(technicalPrompt(context('live_coding'))).toContain('Live coding');
    expect(technicalPrompt(context('system_design'))).toContain(
      'System design'
    );
    expect(technicalPrompt(context('test_task'))).toContain(
      'do NOT solve a real employer task'
    );
    expect(technicalPrompt(context(null, 'Pair programming'))).toContain(
      '"Pair programming"'
    );
    expect(technicalPrompt(context('technical_interview'))).toContain(
      'Middle candidate'
    );
  });

  it('adapts HR prompts to the exact stage', () => {
    expect(hrPrompt(context('hr_screening'))).toContain('salary expectations');
    expect(hrPrompt(context('team_interview'))).toContain('code review');
    expect(hrPrompt(context('final_interview'))).toContain('career goals');
  });

  it('puts the user description first for custom stages', () => {
    const prompt = customPrompt(
      context(null, 'Meeting with CTO', 'Architecture of microservices')
    );
    expect(prompt).toContain('"Architecture of microservices"');
    expect(customPrompt(context('offer_negotiation'))).toContain(
      'Offer negotiation'
    );
  });
});
