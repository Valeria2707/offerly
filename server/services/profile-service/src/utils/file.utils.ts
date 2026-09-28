import { basename } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import {
  DOCX_MIME_TYPE,
  FILENAME_CONTROL_CHARACTERS_PATTERN,
  PDF_FILE_SIGNATURE,
  PDF_MIME_TYPE,
  ZIP_FILE_SIGNATURE
} from '../cv/cv.constants';

export function sanitizeFilename(filename: string): string {
  return (
    basename(filename)
      .replace(FILENAME_CONTROL_CHARACTERS_PATTERN, '')
      .slice(0, 255) || 'cv'
  );
}

export function validateCvFileSignature(file: Express.Multer.File): void {
  const isPdf =
    file.mimetype === PDF_MIME_TYPE &&
    file.buffer.subarray(0, PDF_FILE_SIGNATURE.length).toString('ascii') ===
      PDF_FILE_SIGNATURE;
  const isDocx =
    file.mimetype === DOCX_MIME_TYPE &&
    file.buffer[0] === ZIP_FILE_SIGNATURE[0] &&
    file.buffer[1] === ZIP_FILE_SIGNATURE[1];

  if (!isPdf && !isDocx) {
    throw new BadRequestException(
      'Only valid PDF and DOCX files are supported'
    );
  }
}
