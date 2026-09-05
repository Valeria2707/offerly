import { ProfileData } from './profile.types';

export const createEmptyProfileData = (): ProfileData => ({
  basics: {
    fullName: null,
    headline: null,
    email: null,
    phone: null,
    location: null,
    summary: null,
    links: []
  },
  preferences: {
    desiredPosition: null,
    level: null,
    workFormat: null,
    expectedSalary: null
  },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  languages: []
});
