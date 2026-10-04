import { UnprocessableEntityException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { isRecord } from '@offerly/helpers';
import {
  CustomContent,
  CvCoverLetterContent,
  HrScreeningContent,
  TechnicalContent
} from '../dto/preparation-content.dto';
import { PreparationType } from '../preparation.enums';
import { PreparationData } from '../preparation.types';
import { questionItems, withQuestionIds } from '../../utils/preparation.utils';

function validateContent<T extends object>(
  cls: ClassConstructor<T>,
  value: unknown
): T {
  if (!isRecord(value))
    throw new UnprocessableEntityException('Invalid preparation content');
  const result = plainToInstance(cls, value);
  if (
    validateSync(result, { whitelist: true, forbidNonWhitelisted: true }).length
  )
    throw new UnprocessableEntityException('Invalid preparation content');
  return result;
}

export function parsePreparation(
  type: PreparationType,
  raw: unknown
): PreparationData {
  const value = withQuestionIds(type, raw);
  let data: PreparationData;
  switch (type) {
    case PreparationType.CV_COVER_LETTER:
      data = { type, content: validateContent(CvCoverLetterContent, value) };
      break;
    case PreparationType.HR_SCREENING:
      data = { type, content: validateContent(HrScreeningContent, value) };
      break;
    case PreparationType.TECHNICAL:
      data = { type, content: validateContent(TechnicalContent, value) };
      break;
    case PreparationType.CUSTOM:
      data = { type, content: validateContent(CustomContent, value) };
      break;
  }
  for (const item of questionItems(data)) delete item.userAnswer;
  return data;
}
