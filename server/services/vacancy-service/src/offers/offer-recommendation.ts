import { BadRequestException } from '@nestjs/common';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import {
  analyzeHierarchy,
  compareAmounts,
  compareRatings,
  consistency,
  localWeights,
  Matrix,
  MAX_CONSISTENCY_RATIO,
  pairwiseMatrix,
  SAATY_SCALE
} from './ahp';
import {
  ComparisonSuggestionDto,
  CriteriaComparisonsDto,
  OfferRecommendationDto
} from './offer-recommendation.dto';

function criteriaMatrix(c: CriteriaComparisonsDto): Matrix {
  return [
    [1, c.salaryVsGrowth, c.salaryVsConditions],
    [1 / c.salaryVsGrowth, 1, c.growthVsConditions],
    [1 / c.salaryVsConditions, 1 / c.growthVsConditions, 1]
  ];
}

const criteriaRatio = (comparisons: CriteriaComparisonsDto): number => {
  const matrix = criteriaMatrix(comparisons);
  return consistency(matrix, localWeights(matrix)).cr;
};

const scalePosition = (value: number): number =>
  SAATY_SCALE.findIndex((item) => Math.abs(item - value) < 1e-9);

type Change = ComparisonSuggestionDto;

const applyChanges = (
  comparisons: CriteriaComparisonsDto,
  changes: Change[]
): CriteriaComparisonsDto =>
  changes.reduce(
    (answers, change) => ({ ...answers, [change.comparison]: change.value }),
    comparisons
  );

const MAX_SUGGESTIONS = 2;

const direction = (value: number): number => Math.sign(Math.log(value));

export function suggestComparisons(
  comparisons: CriteriaComparisonsDto
): Change[][] {
  const keys = Object.keys(comparisons) as (keyof CriteriaComparisonsDto)[];
  const options = (key: keyof CriteriaComparisonsDto): Change[] =>
    SAATY_SCALE.filter(
      (value) => scalePosition(value) !== scalePosition(comparisons[key])
    ).map((value) => ({ comparison: key, value }));
  const steps = (changes: Change[]): number =>
    changes.reduce(
      (sum, change) =>
        sum +
        Math.abs(
          scalePosition(change.value) -
            scalePosition(comparisons[change.comparison])
        ),
      0
    );
  const keepsDirection = (changes: Change[]): boolean =>
    changes.every(
      (change) =>
        direction(change.value) === direction(comparisons[change.comparison])
    );

  const single = keys.flatMap((key) => options(key).map((change) => [change]));
  const double = keys.flatMap((first, i) =>
    keys
      .slice(i + 1)
      .flatMap((second) =>
        options(first).flatMap((a) => options(second).map((b) => [a, b]))
      )
  );

  return [...single, ...double]
    .map((changes) => ({
      changes,
      keeps: keepsDirection(changes),
      steps: steps(changes),
      cr: criteriaRatio(applyChanges(comparisons, changes))
    }))
    .filter((item) => item.cr <= MAX_CONSISTENCY_RATIO)
    .sort(
      (a, b) =>
        Number(b.keeps) - Number(a.keeps) ||
        a.changes.length - b.changes.length ||
        a.steps - b.steps ||
        a.cr - b.cr
    )
    .slice(0, MAX_SUGGESTIONS)
    .map((item) => item.changes);
}

export function recommendOffer(
  offers: Vacancy[],
  comparisons: CriteriaComparisonsDto
): OfferRecommendationDto {
  const incomplete = offers.find(
    (offer) =>
      offer.offerSalary === null ||
      offer.offerGrowth === null ||
      offer.offerConditions === null
  );
  if (incomplete)
    throw new BadRequestException(
      `Fill in salary, growth and conditions for the offer from ${incomplete.company}`
    );

  const matrices = {
    criteria: criteriaMatrix(comparisons),
    salary: pairwiseMatrix(
      offers.map((offer) => offer.offerSalary!),
      compareAmounts
    ),
    growth: pairwiseMatrix(
      offers.map((offer) => offer.offerGrowth!),
      compareRatings
    ),
    conditions: pairwiseMatrix(
      offers.map((offer) => offer.offerConditions!),
      compareRatings
    )
  };
  const result = analyzeHierarchy(matrices.criteria, [
    matrices.salary,
    matrices.growth,
    matrices.conditions
  ]);
  const [salary, growth, conditions] = result.localWeights;
  const ranking = offers
    .map((offer, i) => ({
      vacancyId: offer.id,
      weight: result.scores[i],
      localWeights: {
        salary: salary[i],
        growth: growth[i],
        conditions: conditions[i]
      }
    }))
    .sort((a, b) => b.weight - a.weight);

  return {
    recommendedVacancyId: ranking[0].vacancyId,
    ranking,
    criteriaWeights: {
      salary: result.criteriaWeights[0],
      growth: result.criteriaWeights[1],
      conditions: result.criteriaWeights[2]
    },
    consistency: {
      ...result.consistency,
      consistent: result.consistency.cr <= MAX_CONSISTENCY_RATIO
    },
    suggestions:
      result.consistency.cr <= MAX_CONSISTENCY_RATIO
        ? []
        : suggestComparisons(comparisons),
    matrices
  };
}
