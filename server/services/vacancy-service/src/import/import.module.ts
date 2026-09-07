import { Module } from '@nestjs/common';
import { JobPageFetcherService } from './job-page-fetcher.service';
import { OpenAiVacancyParserService } from './openai-vacancy-parser.service';
@Module({
  providers: [JobPageFetcherService, OpenAiVacancyParserService],
  exports: [JobPageFetcherService, OpenAiVacancyParserService]
})
export class ImportModule {}
