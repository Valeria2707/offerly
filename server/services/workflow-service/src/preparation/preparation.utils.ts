import { PreparationResponseDto } from './dto/preparation.dto';
import { StagePreparation } from './entities/stage-preparation.entity';

export function toPreparationResponse(
  preparation: StagePreparation
): PreparationResponseDto {
  return {
    id: preparation.id,
    stageId: preparation.stageId,
    version: preparation.version,
    cv: preparation.cv,
    coverLetter: preparation.coverLetter,
    prompt: preparation.prompt,
    target: preparation.target,
    createdAt: preparation.createdAt
  };
}
