"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  offerRecommendationRequest,
  updateVacancyRequest,
} from "@/api/vacancies";
import { vacancyKeys } from "@/hooks/use-vacancies";
import { getAccessToken } from "@/stores/auth-store";
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
      const token = getAccessToken()!;
      await Promise.all(
        offers.map((offer) =>
          updateVacancyRequest(token, offer.vacancyId, offer.details),
        ),
      );
      return offerRecommendationRequest(
        token,
        offers.map((offer) => offer.vacancyId),
        comparisons,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list }),
  });
}
