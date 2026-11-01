"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyCvImportRequest,
  importCvRequest,
  profileRequest,
  updateProfileRequest,
} from "@/api/profile";
import { useAuthStore } from "@/stores/auth-store";
import type { ProfileData } from "@/types/profile";

export const profileKeys = {
  profile: ["profile"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: () => profileRequest(),
    enabled: Boolean(accessToken),
  });
}

export function useImportCv() {
  return useMutation({
    mutationFn: (file: File) => importCvRequest(file),
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
        ? applyCvImportRequest(importId, data)
        : updateProfileRequest(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.profile, profile);
    },
  });
}
