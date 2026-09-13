import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StageType } from './entities/stage-type.entity';
import { StageTypeController } from './stage-type.controller';
import { StageTypeService } from './stage-type.service';
@Module({
  imports: [TypeOrmModule.forFeature([StageType])],
  controllers: [StageTypeController],
  providers: [StageTypeService],
  exports: [TypeOrmModule]
})
export class StageTypeModule {}
