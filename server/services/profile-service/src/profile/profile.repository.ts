import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCvImportData } from '../cv/types/cv-import.types';
import { CvImport } from './entities/cv-import.entity';
import { Profile } from './entities/profile.entity';
import { createEmptyProfileData } from './profile.defaults';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(CvImport) private readonly imports: Repository<CvImport>,
    private readonly dataSource: DataSource
  ) {}

  async findOrCreateProfile(userId: string): Promise<Profile> {
    const existing = await this.profiles.findOneBy({ userId });
    if (existing) return existing;

    try {
      return await this.profiles.save(this.profiles.create({ userId, data: createEmptyProfileData() }));
    } catch (error) {
      const concurrentlyCreated = await this.profiles.findOneBy({ userId });
      if (!concurrentlyCreated) throw error;
      return concurrentlyCreated;
    }
  }

  saveProfile(profile: Profile): Promise<Profile> {
    return this.profiles.save(profile);
  }

  createImport(input: CreateCvImportData): Promise<CvImport> {
    return this.imports.save(this.imports.create(input));
  }

  saveImport(cvImport: CvImport): Promise<CvImport> {
    return this.imports.save(cvImport);
  }

  async saveAppliedImport(profile: Profile, cvImport: CvImport): Promise<Profile> {
    return this.dataSource.transaction(async (manager) => {
      const savedProfile = await manager.save(Profile, profile);
      await manager.save(CvImport, cvImport);
      return savedProfile;
    });
  }

  async findImport(userId: string, importId: string): Promise<CvImport> {
    const cvImport = await this.imports.findOneBy({ id: importId, userId });
    if (!cvImport) throw new NotFoundException('CV import not found');
    return cvImport;
  }
}
