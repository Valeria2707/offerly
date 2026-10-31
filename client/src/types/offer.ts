export const OFFER_CRITERIA = ["salary", "growth", "conditions"] as const;

export type OfferCriterion = (typeof OFFER_CRITERIA)[number];

export type CriteriaComparisons = {
  salaryVsGrowth: number;
  salaryVsConditions: number;
  growthVsConditions: number;
};

export type ComparisonChange = {
  comparison: keyof CriteriaComparisons;
  value: number;
};

export type CriteriaValues = Record<OfferCriterion, number>;

export type OfferRecommendation = {
  recommendedVacancyId: string;
  ranking: {
    vacancyId: string;
    weight: number;
    localWeights: CriteriaValues;
  }[];
  criteriaWeights: CriteriaValues;
  suggestions: ComparisonChange[][];
  consistency: {
    lambdaMax: number;
    ci: number;
    cr: number;
    consistent: boolean;
  };
  matrices: Record<"criteria" | OfferCriterion, number[][]>;
};
