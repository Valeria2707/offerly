import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiLogModule } from '@offerly/nest-common';
import { CvModule } from '../cv/cv.module';
import { CvImport } from './entities/cv-import.entity';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, CvImport]),
    CvModule,
    AiLogModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository]
})
export class ProfileModule {}
