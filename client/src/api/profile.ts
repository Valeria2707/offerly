import { PROFILE_API_BASE_URL, PROFILE_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { CvImport, Profile, ProfileData } from "@/types/profile";

const withProfileService = { baseUrl: PROFILE_API_BASE_URL };

export const profileRequest = (token: string) =>
  apiRequest<Profile>(PROFILE_ROUTES.profile, { ...withProfileService, token });

export const updateProfileRequest = (token: string, data: ProfileData) =>
  apiRequest<Profile>(PROFILE_ROUTES.profile, {
    ...withProfileService,
    method: "PATCH",
    body: data,
    token,
  });

export const importCvRequest = (token: string, file: File) => {
  const form = new FormData();
  form.append("file", file);

  return apiRequest<CvImport>(PROFILE_ROUTES.cvImports, {
    ...withProfileService,
    method: "POST",
    body: form,
    token,
  });
};

export const applyCvImportRequest = (
  token: string,
  importId: string,
  data: ProfileData,
) =>
  apiRequest<Profile>(PROFILE_ROUTES.applyCvImport(importId), {
    ...withProfileService,
    method: "POST",
    body: { data },
    token,
  });
