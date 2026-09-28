import { BadRequestException, Injectable } from '@nestjs/common';
import { JobPageFetcherService } from '../import/job-page-fetcher.service';
import { OpenAiVacancyParserService } from '../import/openai-vacancy-parser.service';
import {
  ApplyVacancyImportDto,
  ImportVacancyTextDto,
  ImportVacancyUrlDto,
  UpdateVacancyDto,
  VacancyImportResponseDto,
  VacancyResponseDto
} from './dto/vacancy.dto';
import {
  createVacancyFingerprint,
  createVacancySourceHash,
  normalizeVacancySourceUrl,
  resolveVacancyImportDraft
} from '../utils/vacancy.utils';
import { VacancyRepository } from './vacancy.repository';
import { VacancyDraftData } from './vacancy.types';

@Injectable()
export class VacancyService {
  constructor(
    private readonly repository: VacancyRepository,
    private readonly pages: JobPageFetcherService,
    private readonly parser: OpenAiVacancyParserService
  ) {}
  list(userId: string): Promise<VacancyResponseDto[]> {
    return this.repository.list(userId);
  }
  get(userId: string, id: string): Promise<VacancyResponseDto> {
    return this.repository.find(userId, id);
  }
  async update(
    userId: string,
    id: string,
    input: UpdateVacancyDto
  ): Promise<VacancyResponseDto> {
    const vacancy = await this.repository.find(userId, id);
    Object.assign(vacancy, input);
    const saved = await this.repository.save(vacancy);
    return saved;
  }
  async delete(userId: string, id: string): Promise<void> {
    const vacancy = await this.repository.find(userId, id);
    await this.repository.remove(vacancy);
  }
  async importUrl(
    userId: string,
    input: ImportVacancyUrlDto
  ): Promise<VacancyImportResponseDto> {
    const sourceUrl = normalizeVacancySourceUrl(input.url);
    const urlDuplicate = await this.repository.findDuplicate(userId, sourceUrl);
    if (urlDuplicate) return this.duplicateResponse(urlDuplicate.id);
    const page = await this.pages.fetch(sourceUrl);
    const sourceHash = createVacancySourceHash(page.content);
    const contentDuplicate = await this.repository.findDuplicate(
      userId,
      sourceUrl,
      sourceHash
    );
    if (contentDuplicate) return this.duplicateResponse(contentDuplicate.id);
    const finalSourceUrl = normalizeVacancySourceUrl(page.url);
    const draft = await this.parser.parse(page.content, finalSourceUrl);
    return this.saveImport(userId, finalSourceUrl, page.content, draft);
  }
  async importText(
    userId: string,
    input: ImportVacancyTextDto
  ): Promise<VacancyImportResponseDto> {
    const content = input.text.trim();
    const sourceHash = createVacancySourceHash(content);
    const contentDuplicate = await this.repository.findDuplicate(
      userId,
      null,
      sourceHash
    );
    if (contentDuplicate) return this.duplicateResponse(contentDuplicate.id);
    const draft = await this.parser.parse(content, null);
    return this.saveImport(userId, null, content, draft);
  }
  async getImport(
    userId: string,
    id: string
  ): Promise<VacancyImportResponseDto> {
    const vacancyImport = await this.repository.findImport(userId, id);
    return this.importResponse(vacancyImport);
  }
  async applyImport(
    userId: string,
    id: string,
    input?: ApplyVacancyImportDto
  ): Promise<VacancyResponseDto> {
    const vacancyImport = await this.repository.findImport(userId, id);
    if (vacancyImport.appliedAt)
      throw new BadRequestException('Vacancy import has already been applied');
    const vacancyData = resolveVacancyImportDraft(
      vacancyImport.draft,
      input?.draft
    );
    const vacancy = await this.repository.createFromImport(
      userId,
      id,
      vacancyData
    );
    return vacancy;
  }
  async saveImport(
    userId: string,
    sourceUrl: string | null,
    content: string,
    draft: VacancyDraftData
  ): Promise<VacancyImportResponseDto> {
    const sourceHash = createVacancySourceHash(content);
    const fingerprint = createVacancyFingerprint(draft);
    const duplicate = await this.repository.findDuplicate(
      userId,
      sourceUrl,
      sourceHash,
      fingerprint
    );
    if (duplicate) return this.duplicateResponse(duplicate.id);
    const vacancyImport = await this.repository.createImport(
      userId,
      sourceUrl,
      sourceHash,
      fingerprint,
      draft
    );
    return this.importResponse(vacancyImport);
  }
  duplicateResponse(existingVacancyId: string): VacancyImportResponseDto {
    return { isDuplicate: true, existingVacancyId };
  }
  importResponse(vacancyImport: {
    id: string;
    sourceUrl: string | null;
    draft: VacancyDraftData;
    appliedAt: Date | null;
    createdAt: Date;
  }): VacancyImportResponseDto {
    return {
      isDuplicate: false,
      existingVacancyId: null,
      id: vacancyImport.id,
      sourceUrl: vacancyImport.sourceUrl,
      draft: vacancyImport.draft,
      appliedAt: vacancyImport.appliedAt,
      createdAt: vacancyImport.createdAt
    };
  }
}
