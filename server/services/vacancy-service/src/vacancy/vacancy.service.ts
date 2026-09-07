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
import { resolveVacancyImportDraft } from '../utils/vacancy.utils';
import { VacancyRepository } from './vacancy.repository';

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
    const page = await this.pages.fetch(input.url);
    const draft = await this.parser.parse(page.content, page.url);
    return this.repository.createImport(userId, page.url, draft);
  }
  async importText(
    userId: string,
    input: ImportVacancyTextDto
  ): Promise<VacancyImportResponseDto> {
    const draft = await this.parser.parse(input.text.trim(), null);
    return this.repository.createImport(userId, null, draft);
  }
  getImport(userId: string, id: string): Promise<VacancyImportResponseDto> {
    return this.repository.findImport(userId, id);
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
}
