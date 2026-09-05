import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { validateCvFileSignature } from '../utils/file.utils';
import { CV_MIN_EXTRACTED_CHARACTERS, PDF_MIME_TYPE } from './cv.constants';

@Injectable()
export class CvTextExtractorService {
  private readonly maxCharacters: number;

  constructor(config: ConfigService) {
    this.maxCharacters = config.getOrThrow<number>('CV_MAX_EXTRACTED_CHARACTERS');
  }

  async extract(file: Express.Multer.File): Promise<string> {
    validateCvFileSignature(file);

    try {
      const text = file.mimetype === PDF_MIME_TYPE
        ? (await pdf(file.buffer)).text
        : (await mammoth.extractRawText({ buffer: file.buffer })).value;
      const normalized = text.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').trim();

      if (normalized.length < CV_MIN_EXTRACTED_CHARACTERS) {
        throw new UnprocessableEntityException('The CV contains too little extractable text; scanned documents are not supported yet');
      }

      if (normalized.length > this.maxCharacters) {
        throw new UnprocessableEntityException('The CV contains more text than the configured processing limit');
      }

      return normalized;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) throw error;
      throw new UnprocessableEntityException('The CV could not be read');
    }
  }
}
