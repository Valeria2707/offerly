"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyCvImportRequest,
  importCvRequest,
  profileRequest,
  updateProfileRequest,
} from "@/api/profile";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { ProfileData } from "@/types/profile";

export const profileKeys = {
  profile: ["profile"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: () => profileRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
  });
}

export function useImportCv() {
  return useMutation({
    mutationFn: (file: File) => importCvRequest(getAccessToken()!, file),
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      importId,
    }: {
      data: ProfileData;
      importId: string | null;
    }) =>
      importId
        ? applyCvImportRequest(getAccessToken()!, importId, data)
        : updateProfileRequest(getAccessToken()!, data),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.profile, profile);
    },
  });
}
