import { load } from 'cheerio';
import { WHITESPACE_PATTERN } from './text.constants';

export function extractReadableJobPage(html: string): string {
  const document = load(html);
  document(
    'script:not([type="application/ld+json"]), style, noscript, svg, nav, footer, header'
  ).remove();
  const structuredData = document('script[type="application/ld+json"]')
    .map((_, element) => document(element).text().trim())
    .get()
    .filter(Boolean)
    .join('\n');
  const title = document('title').first().text().trim();
  const body = document('body').text().replace(WHITESPACE_PATTERN, ' ').trim();
  return [
    `Page title: ${title}`,
    `Visible content: ${body}`,
    `Structured job data: ${structuredData}`
  ]
    .filter((part) => !part.endsWith(': '))
    .join('\n\n');
}
