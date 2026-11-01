import { randomUUID } from 'node:crypto';
import { KAFKA_TOPICS } from '@offerly/helpers';
import { parseVacancyCreatedEvent } from '../src/events/vacancy-created.event';

describe('parseVacancyCreatedEvent', () => {
  it('accepts the vacancy-created contract', async () => {
    const event = await parseVacancyCreatedEvent({
      eventId: randomUUID(),
      eventType: KAFKA_TOPICS.VACANCY_CREATED,
      occurredAt: new Date().toISOString(),
      producer: 'vacancy-service',
      data: { vacancyId: randomUUID(), userId: randomUUID() }
    });
    expect(event?.eventType).toBe(KAFKA_TOPICS.VACANCY_CREATED);
  });

  it('rejects malformed event data', async () => {
    await expect(
      parseVacancyCreatedEvent({
        eventId: 'invalid',
        eventType: KAFKA_TOPICS.VACANCY_CREATED,
        data: {}
      })
    ).resolves.toBeNull();
  });
});
