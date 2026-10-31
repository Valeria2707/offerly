import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnswerReviewContent } from '../dto/preparation-content.dto';
import { parseAnswerReview } from '../output/preparation-output.parser';
import { ANSWER_REVIEW_SCHEMA } from '../output/preparation-output.schema';
import { REVIEW_SCHEMA_NAME } from '../preparation.constants';
import { AnswerReviewContext } from '../preparation.types';
import { ANSWER_REVIEW_INSTRUCTIONS } from '../prompts/preparation-prompts.constants';
import { requestStructuredOutput } from './openai-structured-output';

@Injectable()
export class AnswerReviewerService {
  private readonly apiKey: string;
  private readonly model: string;
  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY', '');
    this.model = config.get<string>('OPENAI_MODEL', '');
  }
  async review(context: AnswerReviewContext): Promise<AnswerReviewContent> {
    const content = await requestStructuredOutput({
      apiKey: this.apiKey,
      model: this.model,
      instructions: ANSWER_REVIEW_INSTRUCTIONS,
      input: JSON.stringify(context),
      schemaName: REVIEW_SCHEMA_NAME,
      schema: ANSWER_REVIEW_SCHEMA,
      label: 'answer review'
    });
    return parseAnswerReview(content);
  }
}
