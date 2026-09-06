import { PdfAnnotation, PdfPageData, PdfTextContent } from '../cv/types/pdf-page.types';

function extractPageText(content: PdfTextContent): string {
  let lastY: number | undefined;

  return content.items.reduce((text, item) => {
    const currentY = item.transform[5];
    const separator = lastY === undefined || lastY === currentY ? '' : '\n';
    lastY = currentY;
    return `${text}${separator}${item.str}`;
  }, '');
}

function extractAnnotationUrl(annotation: PdfAnnotation): string | undefined {
  const url = annotation.url ?? annotation.unsafeUrl;
  return typeof url === 'string' && url.trim() ? url.trim() : undefined;
}

export async function renderPdfPageWithLinks(page: PdfPageData): Promise<string> {
  const [content, annotations] = await Promise.all([
    page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false }),
    page.getAnnotations()
  ]);
  const text = extractPageText(content);
  const links = [...new Set(annotations.map(extractAnnotationUrl).filter((url): url is string => url !== undefined))];

  return links.length > 0
    ? `${text}\n\nEmbedded links:\n${links.join('\n')}`
    : text;
}
