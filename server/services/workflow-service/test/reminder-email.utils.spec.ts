import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { StageStatus } from '../src/workflow/workflow.enums';
import {
  digestHtml,
  isQuiet,
  stageHtml
} from '../src/utils/reminder-email.utils';

const at = (time: string): Date => new Date(`2026-11-02T${time}:00`);

function stage(name: string, scheduledAt: Date): WorkflowStage {
  return {
    name,
    scheduledAt,
    status: StageStatus.SCHEDULED,
    workflow: { vacancyId: 'vacancy' }
  } as WorkflowStage;
}

describe('reminder email utilities', () => {
  it('handles quiet hours that cross midnight', () => {
    expect(isQuiet(at('23:30'), '22:00', '08:00')).toBe(true);
    expect(isQuiet(at('07:59'), '22:00', '08:00')).toBe(true);
    expect(isQuiet(at('08:00'), '22:00', '08:00')).toBe(false);
    expect(isQuiet(at('13:00'), '12:00', '14:00')).toBe(true);
  });
  it('escapes stage names that the user typed', () => {
    const html = stageHtml(
      stage('<img src=x onerror=alert(1)>', at('10:00')),
      'https://app.example'
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('https://app.example/vacancies/vacancy');
  });
  it('lists at most ten upcoming events in the digest', () => {
    const now = at('09:00');
    const stages = Array.from({ length: 12 }, (_, index) =>
      stage(`Stage ${index}`, new Date(now.getTime() + (index + 1) * 3_600_000))
    );
    const html = digestHtml(stages, now, 'https://app.example');
    expect(html.match(/<li>/g)).toHaveLength(10);
    expect(html).toContain('…і ще 2.');
  });
});
