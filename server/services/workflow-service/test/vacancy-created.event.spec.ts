import { randomUUID } from 'node:crypto';
import { VACANCY_CREATED_TOPIC } from '../src/events/events.constants';
import { parseVacancyCreatedEvent } from '../src/events/vacancy-created.event';

describe('parseVacancyCreatedEvent', () => {
  it('accepts the vacancy-created contract', async () => {
    const event = await parseVacancyCreatedEvent({
      eventId: randomUUID(),
      eventType: VACANCY_CREATED_TOPIC,
      occurredAt: new Date().toISOString(),
      producer: 'vacancy-service',
      data: { vacancyId: randomUUID(), userId: randomUUID() }
    });
    expect(event?.eventType).toBe(VACANCY_CREATED_TOPIC);
  });

  it('rejects malformed event data', async () => {
    await expect(
      parseVacancyCreatedEvent({
        eventId: 'invalid',
        eventType: VACANCY_CREATED_TOPIC,
        data: {}
      })
    ).resolves.toBeNull();
  });
});
