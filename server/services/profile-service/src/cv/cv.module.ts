import { Module } from '@nestjs/common';
import { CvTextExtractorService } from './cv-text-extractor.service';
import { OpenAiCvParserService } from './openai-cv-parser.service';

@Module({
  providers: [CvTextExtractorService, OpenAiCvParserService],
  exports: [CvTextExtractorService, OpenAiCvParserService]
})
export class CvModule {}
