import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { CvTextExtractorService } from '../src/cv/cv-text-extractor.service';

describe('CvTextExtractorService', () => {
  const service = new CvTextExtractorService(new ConfigService({ CV_MAX_EXTRACTED_CHARACTERS: 100_000 }));

  it('rejects a file whose content does not match the claimed PDF type', async () => {
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'resume.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 12,
      buffer: Buffer.from('not a pdf'),
      stream: Readable.from([]),
      destination: '',
      filename: '',
      path: ''
    };

    await expect(service.extract(file)).rejects.toBeInstanceOf(BadRequestException);
  });
});
