export type Matrix = number[][];

export interface Consistency {
  lambdaMax: number;
  ci: number;
  cr: number;
}

export interface AhpResult {
  criteriaWeights: number[];
  consistency: Consistency;
  localWeights: number[][];
  scores: number[];
}

/** The Saaty scale from "extremely more important" to "extremely less important". */
export const SAATY_SCALE = [9, 7, 5, 3, 1, 1 / 3, 1 / 5, 1 / 7, 1 / 9];

/** Saaty random index by matrix size. */
const RANDOM_INDEX = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
const SAATY_STEPS = [1, 3, 5, 7, 9];

export const MAX_CONSISTENCY_RATIO = 0.1;

/** Builds a reciprocal matrix: matrix[i][j] = compare(values[i], values[j]). */
export function pairwiseMatrix<T>(
  values: T[],
  compare: (a: T, b: T) => number
): Matrix {
  return values.map((a) => values.map((b) => compare(a, b)));
}

/** Ratings 1–5: every point of difference is one step of the Saaty scale (1, 3, 5, 7, 9). */
export function compareRatings(a: number, b: number): number {
  const step = SAATY_STEPS[Math.min(Math.abs(a - b), SAATY_STEPS.length - 1)];
  return a >= b ? step : 1 / step;
}

/** Amounts (e.g. salary): every 10 % of difference adds one point, up to 9. */
export function compareAmounts(a: number, b: number): number {
  const ratio = Math.max(a, b) / Math.min(a, b);
  const step = Math.min(9, Math.round(1 + (ratio - 1) * 10));
  return a >= b ? step : 1 / step;
}

/** Normalizes every column by its sum and averages each row. */
export function localWeights(matrix: Matrix): number[] {
  const n = matrix.length;
  const columnSums = matrix[0].map((_, j) =>
    matrix.reduce((sum, row) => sum + row[j], 0)
  );
  return matrix.map(
    (row) => row.reduce((sum, value, j) => sum + value / columnSums[j], 0) / n
  );
}

/** λmax = average of (A·w)ᵢ / wᵢ; CI = (λmax − n) / (n − 1); CR = CI / RI. */
export function consistency(matrix: Matrix, weights: number[]): Consistency {
  const n = matrix.length;
  if (n <= 2) return { lambdaMax: n, ci: 0, cr: 0 };
  const lambdaMax =
    matrix.reduce((sum, row, i) => {
      const product = row.reduce(
        (acc, value, j) => acc + value * weights[j],
        0
      );
      return sum + product / weights[i];
    }, 0) / n;
  const ci = (lambdaMax - n) / (n - 1);
  return { lambdaMax, ci, cr: ci / RANDOM_INDEX[n] };
}

/** Global weight of alternative i = Σⱼ (local weight of i by criterion j) · (weight of criterion j). */
export function analyzeHierarchy(
  criteria: Matrix,
  alternatives: Matrix[]
): AhpResult {
  const criteriaWeights = localWeights(criteria);
  const local = alternatives.map(localWeights);
  const scores = local[0].map((_, i) =>
    local.reduce((sum, weights, j) => sum + weights[i] * criteriaWeights[j], 0)
  );
  return {
    criteriaWeights,
    consistency: consistency(criteria, criteriaWeights),
    localWeights: local,
    scores
  };
}
