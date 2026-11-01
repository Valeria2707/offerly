import { PROFILE_API_BASE_URL, PROFILE_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { CvImport, Profile, ProfileData } from "@/types/profile";

const withProfileService = { baseUrl: PROFILE_API_BASE_URL };

export const profileRequest = () =>
  apiRequest<Profile>(PROFILE_ROUTES.profile, { ...withProfileService });

export const updateProfileRequest = (data: ProfileData) =>
  apiRequest<Profile>(PROFILE_ROUTES.profile, {
    ...withProfileService,
    method: "PATCH",
    body: data,
  });

export const importCvRequest = (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return apiRequest<CvImport>(PROFILE_ROUTES.cvImports, {
    ...withProfileService,
    method: "POST",
    body: form,
  });
};

export const applyCvImportRequest = (importId: string, data: ProfileData) =>
  apiRequest<Profile>(PROFILE_ROUTES.applyCvImport(importId), {
    ...withProfileService,
    method: "POST",
    body: { data },
  });
