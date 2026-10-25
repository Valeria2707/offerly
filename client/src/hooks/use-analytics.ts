"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { analyticsRequest } from "@/api/analytics";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { AnalyticsPeriod } from "@/types/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  period: (period: AnalyticsPeriod) =>
    ["analytics", period ?? "all"] as const,
};

export function useAnalytics(period: AnalyticsPeriod) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: analyticsKeys.period(period),
    queryFn: () => analyticsRequest(getAccessToken()!, period),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });
}
