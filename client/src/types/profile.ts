export type ProfileLink = {
  label: string;
  url: string;
};

export type ProfileBasics = {
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  links: ProfileLink[];
};

export type ProfilePreferences = {
  desiredPosition: string | null;
  level: string | null;
  workFormat: string | null;
  expectedSalary: string | null;
};

export type ProfileSkill = {
  name: string;
  level: string | null;
};

export type ProfileExperience = {
  company: string;
  title: string;
  /** YYYY або YYYY-MM. */
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  location: string | null;
  description: string | null;
  highlights: string[];
  skills: string[];
};

export type ProfileEducation = {
  institution: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export type ProfileProject = {
  name: string;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  highlights: string[];
  skills: string[];
};

export type ProfileLanguage = {
  name: string;
  level: string | null;
};

export type ProfileData = {
  basics: ProfileBasics;
  preferences: ProfilePreferences;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  projects: ProfileProject[];
  languages: ProfileLanguage[];
};

export type Profile = {
  id: string;
  userId: string;
  data: ProfileData;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CvImportStatus = "processing" | "ready" | "applied" | "failed";

export type CvImport = {
  id: string;
  status: CvImportStatus;
  originalFilename: string;
  draftData: ProfileData | null;
  modelName: string | null;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
};
