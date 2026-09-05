import { CvImportResponseDto, ProfileDataDto, ProfileResponseDto, UpdateProfileDto } from '../profile/dto/profile.dto';
import { CvImport } from '../profile/entities/cv-import.entity';
import { Profile } from '../profile/entities/profile.entity';
import { ProfileData } from '../profile/profile.types';

export function mergeProfileDraft(current: ProfileData, draft: ProfileData): ProfileData {
  return {
    ...current,
    basics: {
      fullName: draft.basics.fullName ?? current.basics.fullName,
      headline: draft.basics.headline ?? current.basics.headline,
      email: draft.basics.email ?? current.basics.email,
      phone: draft.basics.phone ?? current.basics.phone,
      location: draft.basics.location ?? current.basics.location,
      summary: draft.basics.summary ?? current.basics.summary,
      links: draft.basics.links.length > 0 ? draft.basics.links : current.basics.links
    },
    preferences: current.preferences,
    skills: draft.skills.length > 0 ? draft.skills : current.skills,
    experience: draft.experience.length > 0 ? draft.experience : current.experience,
    education: draft.education.length > 0 ? draft.education : current.education,
    projects: draft.projects.length > 0 ? draft.projects : current.projects,
    languages: draft.languages.length > 0 ? draft.languages : current.languages
  };
}

export function updateProfileData(current: ProfileData, update: UpdateProfileDto): ProfileData {
  return {
    basics: { ...current.basics, ...update.basics },
    preferences: { ...current.preferences, ...update.preferences },
    skills: update.skills ?? current.skills,
    experience: update.experience ?? current.experience,
    education: update.education ?? current.education,
    projects: update.projects ?? current.projects,
    languages: update.languages ?? current.languages
  };
}

export function toProfileData(data: ProfileDataDto): ProfileData {
  return {
    basics: {
      fullName: data.basics.fullName ?? null,
      headline: data.basics.headline ?? null,
      email: data.basics.email ?? null,
      phone: data.basics.phone ?? null,
      location: data.basics.location ?? null,
      summary: data.basics.summary ?? null,
      links: data.basics.links ?? []
    },
    preferences: {
      desiredPosition: data.preferences.desiredPosition ?? null,
      level: data.preferences.level ?? null,
      workFormat: data.preferences.workFormat ?? null,
      expectedSalary: data.preferences.expectedSalary ?? null
    },
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    projects: data.projects,
    languages: data.languages
  };
}

export function toProfileResponse(profile: Profile): ProfileResponseDto {
  return {
    id: profile.id,
    userId: profile.userId,
    data: profile.data,
    version: profile.version,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}

export function toCvImportResponse(cvImport: CvImport): CvImportResponseDto {
  return {
    id: cvImport.id,
    status: cvImport.status,
    originalFilename: cvImport.originalFilename,
    draftData: cvImport.draftData,
    modelName: cvImport.modelName,
    schemaVersion: cvImport.schemaVersion,
    createdAt: cvImport.createdAt,
    updatedAt: cvImport.updatedAt
  };
}
