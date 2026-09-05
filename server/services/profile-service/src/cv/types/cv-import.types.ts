import { CvImportStatus } from '../../profile/enums/cv-import-status.enum';
import { ProfileData } from '../../profile/profile.types';

export interface CreateCvImportData {
  userId: string;
  originalFilename: string;
  mimeType: string;
  contentSha256: string;
  status: CvImportStatus;
  draftData: ProfileData | null;
  modelName: string | null;
  schemaVersion: string;
  errorCode: string | null;
  appliedAt: Date | null;
}
