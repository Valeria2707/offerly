import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiLogService } from './ai-log.service';
import { AiOperation } from './ai-operation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiOperation])],
  providers: [AiLogService],
  exports: [AiLogService]
})
export class AiLogModule {}
