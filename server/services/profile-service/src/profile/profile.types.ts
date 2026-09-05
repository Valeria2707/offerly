export interface ProfileLink {
  label: string;
  url: string;
}

export interface ProfileBasics {
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  links: ProfileLink[];
}

export interface ProfilePreferences {
  desiredPosition: string | null;
  level: string | null;
  workFormat: string | null;
  expectedSalary: string | null;
}

export interface ProfileSkill {
  name: string;
  level: string | null;
}

export interface ProfileExperience {
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  location: string | null;
  description: string | null;
  highlights: string[];
  skills: string[];
}

export interface ProfileEducation {
  institution: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface ProfileProject {
  name: string;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  highlights: string[];
  skills: string[];
}

export interface ProfileLanguage {
  name: string;
  level: string | null;
}

export interface ProfileData {
  basics: ProfileBasics;
  preferences: ProfilePreferences;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  projects: ProfileProject[];
  languages: ProfileLanguage[];
}
