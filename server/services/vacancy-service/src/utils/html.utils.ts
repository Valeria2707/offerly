import { load } from 'cheerio';

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
  const body = document('body').text().replace(/\s+/g, ' ').trim();
  return [
    `Page title: ${title}`,
    `Visible content: ${body}`,
    `Structured job data: ${structuredData}`
  ]
    .filter((part) => !part.endsWith(': '))
    .join('\n\n');
}
