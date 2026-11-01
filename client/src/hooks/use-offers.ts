"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  offerRecommendationRequest,
  updateVacancyRequest,
} from "@/api/vacancies";
import { vacancyKeys } from "@/hooks/use-vacancies";
import type { CriteriaComparisons } from "@/types/offer";
import type { OfferDetails } from "@/types/vacancy";

export function useCompareOffers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offers,
      comparisons,
    }: {
      offers: { vacancyId: string; details: OfferDetails }[];
      comparisons: CriteriaComparisons;
    }) => {
      await Promise.all(
        offers.map((offer) =>
          updateVacancyRequest(offer.vacancyId, offer.details),
        ),
      );
      return offerRecommendationRequest(
        offers.map((offer) => offer.vacancyId),
        comparisons,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list }),
  });
}
