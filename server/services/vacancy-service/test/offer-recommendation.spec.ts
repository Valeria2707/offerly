import { BadRequestException } from '@nestjs/common';
import { recommendOffer } from '../src/offers/offer-recommendation';
import { Vacancy } from '../src/vacancy/entities/vacancy.entity';

const offer = (
  id: string,
  offerSalary: number | null,
  offerGrowth: number | null,
  offerConditions: number | null
): Vacancy =>
  ({ id, company: id, offerSalary, offerGrowth, offerConditions }) as Vacancy;

describe('offer recommendation', () => {
  const offers = [
    offer('acme', 5000, 3, 2),
    offer('nordic', 4200, 5, 4),
    offer('beta', 4800, 4, 3)
  ];

  it('recommends by salary when salary matters most', () => {
    const result = recommendOffer(offers, {
      salaryVsGrowth: 7,
      salaryVsConditions: 9,
      growthVsConditions: 3
    });
    expect(result.recommendedVacancyId).toBe('acme');
    expect(result.criteriaWeights.salary).toBeGreaterThan(0.6);
    expect(result.consistency.consistent).toBe(true);
  });
  it('recommends by growth when growth matters most', () => {
    const result = recommendOffer(offers, {
      salaryVsGrowth: 1 / 7,
      salaryVsConditions: 1,
      growthVsConditions: 5
    });
    expect(result.recommendedVacancyId).toBe('nordic');
    expect(result.ranking.map((item) => item.vacancyId)).toEqual([
      'nordic',
      'beta',
      'acme'
    ]);
    expect(result.ranking[0].weight).toBeGreaterThan(result.ranking[1].weight);
    expect(result.matrices.salary).toHaveLength(3);
  });
  it('flags contradictory criteria comparisons', () => {
    const result = recommendOffer(offers, {
      salaryVsGrowth: 9,
      salaryVsConditions: 1 / 9,
      growthVsConditions: 9
    });
    expect(result.consistency.consistent).toBe(false);
  });
  it('suggests adjusting strength first, keeping which criterion is more important', () => {
    const comparisons = {
      salaryVsGrowth: 7,
      salaryVsConditions: 7,
      growthVsConditions: 1 / 3
    };
    const result = recommendOffer(offers, comparisons);
    expect(result.consistency.consistent).toBe(false);
    expect(result.suggestions).toHaveLength(2);
    for (const changes of result.suggestions) {
      const answers = changes.reduce(
        (current, change) => ({
          ...current,
          [change.comparison]: change.value
        }),
        comparisons
      );

      expect(answers.growthVsConditions).toBeLessThan(1);
      expect(answers.salaryVsGrowth).toBeGreaterThan(1);
      expect(answers.salaryVsConditions).toBeGreaterThan(1);
      const fixed = recommendOffer(offers, answers);
      expect(fixed.consistency.consistent).toBe(true);
      expect(fixed.suggestions).toEqual([]);
    }
  });
  it('suggests two changes when one is not enough', () => {
    const comparisons = {
      salaryVsGrowth: 9,
      salaryVsConditions: 1 / 9,
      growthVsConditions: 9
    };
    const [changes] = recommendOffer(offers, comparisons).suggestions;
    const answers = changes.reduce(
      (current, change) => ({ ...current, [change.comparison]: change.value }),
      comparisons
    );
    expect(recommendOffer(offers, answers).consistency.consistent).toBe(true);
  });
  it('asks to fill in every offer before comparing', () => {
    expect(() =>
      recommendOffer([...offers, offer('gamma', 4000, null, 3)], {
        salaryVsGrowth: 1,
        salaryVsConditions: 1,
        growthVsConditions: 1
      })
    ).toThrow(BadRequestException);
  });
});
