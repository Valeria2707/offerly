import { ANALYTICS_ROUTES, WORKFLOW_API_BASE_URL } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { Analytics, AnalyticsPeriod } from "@/types/analytics";

export const analyticsRequest = (token: string, period: AnalyticsPeriod) =>
  apiRequest<Analytics>(ANALYTICS_ROUTES.analytics(period), {
    baseUrl: WORKFLOW_API_BASE_URL,
    token,
  });
