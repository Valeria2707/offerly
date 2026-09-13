import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStageTypeDto, UpdateStageTypeDto } from './dto/stage-type.dto';
import { StageType } from './entities/stage-type.entity';
@Injectable()
export class StageTypeService {
  constructor(
    @InjectRepository(StageType) readonly types: Repository<StageType>
  ) {}
  list(userId: string): Promise<StageType[]> {
    return this.types
      .createQueryBuilder('type')
      .where('type.isActive = true')
      .andWhere('(type.ownerUserId IS NULL OR type.ownerUserId = :userId)', {
        userId
      })
      .orderBy('type.ownerUserId', 'ASC', 'NULLS FIRST')
      .addOrderBy('type.name', 'ASC')
      .getMany();
  }
  create(userId: string, input: CreateStageTypeDto): Promise<StageType> {
    return this.types.save(
      this.types.create({
        ownerUserId: userId,
        code: null,
        isActive: true,
        requiresPreparation: false,
        supportsDeadline: false,
        producesArtifact: false,
        ...input
      })
    );
  }
  async update(
    userId: string,
    id: string,
    input: UpdateStageTypeDto
  ): Promise<StageType> {
    const type = await this.findOwned(userId, id);
    Object.assign(type, input);
    return this.types.save(type);
  }
  async remove(userId: string, id: string): Promise<void> {
    const type = await this.findOwned(userId, id);
    type.isActive = false;
    await this.types.save(type);
  }
  async findOwned(userId: string, id: string): Promise<StageType> {
    const type = await this.types.findOneBy({ id });
    if (!type) throw new NotFoundException('Stage type not found');
    if (type.ownerUserId !== userId)
      throw new ForbiddenException(
        'System and other users stage types cannot be changed'
      );
    return type;
  }
}
