export interface PdfTextItem {
  str: string;
  transform: number[];
}

export interface PdfTextContent {
  items: PdfTextItem[];
}

export interface PdfAnnotation {
  url?: string;
  unsafeUrl?: string;
}

export interface PdfPageData {
  getTextContent(options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }): Promise<PdfTextContent>;
  getAnnotations(): Promise<PdfAnnotation[]>;
}
