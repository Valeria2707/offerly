import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyImport } from './entities/vacancy-import.entity';
import { VacancyData, VacancyDraftData } from './vacancy.types';

@Injectable()
export class VacancyRepository {
  constructor(
    @InjectRepository(Vacancy) private readonly vacancies: Repository<Vacancy>,
    @InjectRepository(VacancyImport)
    private readonly imports: Repository<VacancyImport>,
    private readonly dataSource: DataSource
  ) {}
  list(userId: string): Promise<Vacancy[]> {
    return this.vacancies.find({
      where: { userId },
      order: { updatedAt: 'DESC' }
    });
  }
  async find(userId: string, id: string): Promise<Vacancy> {
    const vacancy = await this.vacancies.findOneBy({ id, userId });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return vacancy;
  }
  save(vacancy: Vacancy): Promise<Vacancy> {
    return this.vacancies.save(vacancy);
  }
  async remove(vacancy: Vacancy): Promise<void> {
    await this.vacancies.remove(vacancy);
  }
  createImport(
    userId: string,
    sourceUrl: string | null,
    draft: VacancyDraftData
  ): Promise<VacancyImport> {
    return this.imports.save(
      this.imports.create({ userId, sourceUrl, draft, appliedAt: null })
    );
  }
  async findImport(userId: string, id: string): Promise<VacancyImport> {
    const vacancyImport = await this.imports.findOneBy({ id, userId });
    if (!vacancyImport) throw new NotFoundException('Vacancy import not found');
    return vacancyImport;
  }
  createFromImport(
    userId: string,
    importId: string,
    data: VacancyData
  ): Promise<Vacancy> {
    return this.dataSource.transaction(async (manager) => {
      const vacancyImport = await manager.findOne(VacancyImport, {
        where: { id: importId, userId },
        lock: { mode: 'pessimistic_write' }
      });
      if (!vacancyImport)
        throw new NotFoundException('Vacancy import not found');
      if (vacancyImport.appliedAt)
        throw new BadRequestException(
          'Vacancy import has already been applied'
        );
      const vacancy = await manager.save(
        Vacancy,
        manager.create(Vacancy, { userId, ...data })
      );
      vacancyImport.appliedAt = new Date();
      await manager.save(VacancyImport, vacancyImport);
      return vacancy;
    });
  }
}
