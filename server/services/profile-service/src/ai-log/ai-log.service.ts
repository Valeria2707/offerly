import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiOperation } from './ai-operation.entity';

@Injectable()
export class AiLogService {
  private readonly logger = new Logger(AiLogService.name);
  constructor(
    @InjectRepository(AiOperation)
    private readonly operations: Repository<AiOperation>
  ) {}

  async track<T>(
    userId: string,
    operation: string,
    run: () => Promise<T>
  ): Promise<T> {
    const startedAt = Date.now();
    try {
      const result = await run();
      await this.save(userId, operation, startedAt, null);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.save(userId, operation, startedAt, message);
      throw error;
    }
  }

  private async save(
    userId: string,
    operation: string,
    startedAt: number,
    error: string | null
  ): Promise<void> {
    try {
      await this.operations.insert({
        userId,
        operation,
        success: error === null,
        error: error?.slice(0, 200) ?? null,
        durationMs: Date.now() - startedAt
      });
    } catch {
      // The log must never break the AI feature itself.
      this.logger.warn(`Could not log AI operation ${operation}`);
    }
  }
}
