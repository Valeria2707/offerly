import { BadRequestException, Injectable } from '@nestjs/common';
import { CvTextExtractorService } from '../cv/cv-text-extractor.service';
import { OpenAiCvParserService } from '../cv/openai-cv-parser.service';
import { CV_SCHEMA_VERSION } from '../cv/cv.constants';
import { getErrorCode } from '../utils/error.utils';
import { sanitizeFilename } from '../utils/file.utils';
import { calculateSha256 } from '../utils/hash.utils';
import { mergeProfileDraft, toCvImportResponse, toProfileData, toProfileResponse, updateProfileData } from '../utils/profile.utils';
import { ApplyCvImportDto, CvImportResponseDto, ProfileResponseDto, UpdateProfileDto } from './dto/profile.dto';
import { CvImportStatus } from './enums/cv-import-status.enum';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly textExtractor: CvTextExtractorService,
    private readonly cvParser: OpenAiCvParserService
  ) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    return toProfileResponse(await this.repository.findOrCreateProfile(userId));
  }

  async updateProfile(userId: string, input: UpdateProfileDto): Promise<ProfileResponseDto> {
    const profile = await this.repository.findOrCreateProfile(userId);
    profile.data = updateProfileData(profile.data, input);
    return toProfileResponse(await this.repository.saveProfile(profile));
  }

  async importCv(userId: string, file: Express.Multer.File | undefined): Promise<CvImportResponseDto> {
    if (!file) throw new BadRequestException('CV file is required');

    const cvImport = await this.repository.createImport({
      userId,
      originalFilename: sanitizeFilename(file.originalname),
      mimeType: file.mimetype,
      contentSha256: calculateSha256(file.buffer),
      status: CvImportStatus.Processing,
      draftData: null,
      modelName: this.cvParser.model,
      schemaVersion: CV_SCHEMA_VERSION,
      errorCode: null,
      appliedAt: null
    });

    try {
      const text = await this.textExtractor.extract(file);
      cvImport.draftData = await this.cvParser.parse(text);
      cvImport.status = CvImportStatus.Ready;
      return toCvImportResponse(await this.repository.saveImport(cvImport));
    } catch (error) {
      cvImport.status = CvImportStatus.Failed;
      cvImport.errorCode = getErrorCode(error);
      await this.repository.saveImport(cvImport);
      throw error;
    }
  }

  async getImport(userId: string, importId: string): Promise<CvImportResponseDto> {
    return toCvImportResponse(await this.repository.findImport(userId, importId));
  }

  async applyImport(userId: string, importId: string, input: ApplyCvImportDto): Promise<ProfileResponseDto> {
    const cvImport = await this.repository.findImport(userId, importId);
    if (cvImport.status !== CvImportStatus.Ready || !cvImport.draftData) {
      throw new BadRequestException('Only a ready CV import can be applied');
    }

    const profile = await this.repository.findOrCreateProfile(userId);
    profile.data = input.data
      ? toProfileData(input.data)
      : mergeProfileDraft(profile.data, cvImport.draftData);

    cvImport.status = CvImportStatus.Applied;
    cvImport.appliedAt = new Date();
    const saved = await this.repository.saveAppliedImport(profile, cvImport);
    return toProfileResponse(saved);
  }
}
