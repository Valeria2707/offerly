import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested
} from 'class-validator';

const SAATY_MIN = 1 / 9;
const SAATY_MAX = 9;
const comparison = {
  minimum: SAATY_MIN,
  maximum: SAATY_MAX,
  description:
    'Saaty scale: 9 — the first criterion is extremely more important, 1 — equal, 1/9 — the second one is'
};

export class CriteriaComparisonsDto {
  @ApiProperty(comparison)
  @IsNumber()
  @Min(SAATY_MIN)
  @Max(SAATY_MAX)
  salaryVsGrowth!: number;
  @ApiProperty(comparison)
  @IsNumber()
  @Min(SAATY_MIN)
  @Max(SAATY_MAX)
  salaryVsConditions!: number;
  @ApiProperty(comparison)
  @IsNumber()
  @Min(SAATY_MIN)
  @Max(SAATY_MAX)
  growthVsConditions!: number;
}

export class OfferRecommendationRequestDto {
  @ApiProperty({ type: [String], minItems: 2, maxItems: 10 })
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  vacancyIds!: string[];
  @ApiProperty({ type: CriteriaComparisonsDto })
  @ValidateNested()
  @Type(() => CriteriaComparisonsDto)
  comparisons!: CriteriaComparisonsDto;
}

export class CriteriaValuesDto {
  @ApiProperty() salary!: number;
  @ApiProperty() growth!: number;
  @ApiProperty() conditions!: number;
}

export class OfferRankingItemDto {
  @ApiProperty({ format: 'uuid' }) vacancyId!: string;
  @ApiProperty({ description: 'Global weight' }) weight!: number;
  @ApiProperty({
    type: CriteriaValuesDto,
    description: 'Local weights of this offer by every criterion'
  })
  localWeights!: CriteriaValuesDto;
}

export class ConsistencyDto {
  @ApiProperty() lambdaMax!: number;
  @ApiProperty() ci!: number;
  @ApiProperty() cr!: number;
  @ApiProperty({ description: 'CR ≤ 0.1' }) consistent!: boolean;
}

export class OfferMatricesDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } }
  })
  criteria!: number[][];
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } }
  })
  salary!: number[][];
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } }
  })
  growth!: number[][];
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } }
  })
  conditions!: number[][];
}

export class ComparisonSuggestionDto {
  @ApiProperty({
    enum: ['salaryVsGrowth', 'salaryVsConditions', 'growthVsConditions']
  })
  comparison!: keyof CriteriaComparisonsDto;
  @ApiProperty({ description: 'Saaty value that makes the answers consistent' })
  value!: number;
}

@ApiExtraModels(ComparisonSuggestionDto)
export class OfferRecommendationDto {
  @ApiProperty({ format: 'uuid' }) recommendedVacancyId!: string;
  @ApiProperty({ type: [OfferRankingItemDto], description: 'Best offer first' })
  ranking!: OfferRankingItemDto[];
  @ApiProperty({ type: CriteriaValuesDto }) criteriaWeights!: CriteriaValuesDto;
  @ApiProperty({
    type: ConsistencyDto,
    description: 'Consistency of the user criteria comparisons'
  })
  consistency!: ConsistencyDto;
  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: { $ref: getSchemaPath(ComparisonSuggestionDto) }
    },
    description:
      'Up to 2 alternative ways (one or two changed answers each) to make the answers consistent; empty when they already are'
  })
  suggestions!: ComparisonSuggestionDto[][];
  @ApiProperty({
    type: OfferMatricesDto,
    description: 'Pairwise matrices; rows and columns follow vacancyIds order'
  })
  matrices!: OfferMatricesDto;
}
