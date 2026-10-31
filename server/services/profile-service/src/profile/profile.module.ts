import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiOperation } from '../ai-log/ai-operation.entity';
import { AiLogService } from '../ai-log/ai-log.service';
import { CvModule } from '../cv/cv.module';
import { CvImport } from './entities/cv-import.entity';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, CvImport, AiOperation]),
    CvModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, AiLogService]
})
export class ProfileModule {}
