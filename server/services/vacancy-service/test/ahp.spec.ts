import {
  analyzeHierarchy,
  compareAmounts,
  compareRatings,
  consistency,
  localWeights,
  pairwiseMatrix
} from '../src/offers/ahp';

const round = (values: number[]): number[] =>
  values.map((value) => Math.round(value * 1000) / 1000);

describe('analytic hierarchy process', () => {
  const criteria = [
    [1, 5, 7],
    [1 / 5, 1, 3],
    [1 / 7, 1 / 3, 1]
  ];

  it('calculates local weights by normalizing columns and averaging rows', () => {
    const weights = localWeights(criteria);
    expect(round(weights)).toEqual([0.724, 0.193, 0.083]);
    expect(weights.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
  });
  it('checks consistency with λmax, CI and CR', () => {
    const result = consistency(criteria, localWeights(criteria));
    expect(result.lambdaMax).toBeCloseTo(3.066, 2);
    expect(result.cr).toBeLessThan(0.1);
    const contradictory = [
      [1, 9, 1 / 9],
      [1 / 9, 1, 9],
      [9, 1 / 9, 1]
    ];
    expect(
      consistency(contradictory, localWeights(contradictory)).cr
    ).toBeGreaterThan(0.1);
    expect(
      consistency(
        [
          [1, 3],
          [1 / 3, 1]
        ],
        [0.75, 0.25]
      ).cr
    ).toBe(0);
  });
  it('turns ratings and amounts into reciprocal Saaty scores', () => {
    expect(compareRatings(5, 3)).toBe(5);
    expect(compareRatings(3, 5)).toBeCloseTo(1 / 5);
    expect(compareRatings(4, 4)).toBe(1);
    expect(compareAmounts(5000, 4200)).toBe(3);
    expect(compareAmounts(4200, 5000)).toBeCloseTo(1 / 3);
    expect(compareAmounts(10000, 2000)).toBe(9);
    expect(pairwiseMatrix([5, 3], compareRatings)).toEqual([
      [1, 5],
      [1 / 5, 1]
    ]);
  });
  it('combines local weights into global weights that sum to 1', () => {
    const alternatives = [
      pairwiseMatrix([6000, 4200, 4500], compareAmounts),
      pairwiseMatrix([3, 5, 4], compareRatings),
      pairwiseMatrix([2, 4, 3], compareRatings)
    ];
    const { scores } = analyzeHierarchy(criteria, alternatives);
    expect(scores.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(scores.indexOf(Math.max(...scores))).toBe(0);
  });
});
