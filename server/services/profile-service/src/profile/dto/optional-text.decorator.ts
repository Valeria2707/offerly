import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export function OptionalText(maxLength: number): PropertyDecorator {
  return applyDecorators(
    ApiPropertyOptional({ type: String, nullable: true, maxLength }),
    IsOptional(),
    IsString(),
    MaxLength(maxLength)
  );
}
