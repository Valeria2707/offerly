import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import {
  assertSafePublicUrl,
  readLimitedResponseBody
} from '../utils/network.utils';
import { extractReadableJobPage } from '../utils/html.utils';
import {
  PAGE_FETCH_TIMEOUT_MS,
  PAGE_MAX_BYTES,
  PAGE_MAX_CHARACTERS,
  PAGE_MAX_REDIRECTS
} from './import.constants';

@Injectable()
export class JobPageFetcherService {
  async fetch(rawUrl: string): Promise<{ url: string; content: string }> {
    let currentUrl = rawUrl;
    for (let redirect = 0; redirect <= PAGE_MAX_REDIRECTS; redirect += 1) {
      const safeUrl = await assertSafePublicUrl(currentUrl);
      let response: Response;
      try {
        response = await fetch(safeUrl, {
          redirect: 'manual',
          signal: AbortSignal.timeout(PAGE_FETCH_TIMEOUT_MS),
          headers: {
            'User-Agent': 'OfferlyVacancyImporter/1.0',
            Accept: 'text/html,application/xhtml+xml'
          }
        });
      } catch {
        throw new UnprocessableEntityException(
          'The vacancy page could not be loaded'
        );
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location)
          throw new UnprocessableEntityException(
            'The vacancy page returned an invalid redirect'
          );
        try {
          currentUrl = new URL(location, safeUrl).toString();
        } catch {
          throw new UnprocessableEntityException(
            'The vacancy page returned an invalid redirect URL'
          );
        }
        continue;
      }
      if (!response.ok)
        throw new UnprocessableEntityException(
          `The vacancy page returned HTTP ${response.status}`
        );
      const contentType =
        response.headers.get('content-type')?.toLowerCase() ?? '';
      if (
        !contentType.includes('text/html') &&
        !contentType.includes('application/xhtml+xml')
      ) {
        throw new BadRequestException(
          'The URL must point to an HTML vacancy page'
        );
      }
      const declaredLength = Number(
        response.headers.get('content-length') ?? 0
      );
      if (declaredLength > PAGE_MAX_BYTES)
        throw new BadRequestException('The vacancy page is too large');
      const html = await readLimitedResponseBody(response, PAGE_MAX_BYTES);
      const content = extractReadableJobPage(html)
        .slice(0, PAGE_MAX_CHARACTERS)
        .trim();
      if (content.length < 100)
        throw new UnprocessableEntityException(
          'The vacancy page contains too little readable content'
        );
      return { url: safeUrl.toString(), content };
    }
    throw new UnprocessableEntityException(
      'The vacancy page has too many redirects'
    );
  }
}
