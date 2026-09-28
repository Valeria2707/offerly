import { URL_SCHEME_PATTERN } from './url.constants';

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return URL_SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
}
