import { renderPdfPageWithLinks } from '../src/utils/pdf-page.utils';

describe('renderPdfPageWithLinks', () => {
  it('adds unique PDF annotation URLs to the extracted page text', async () => {
    const page = {
      getTextContent: jest.fn().mockResolvedValue({
        items: [
          { str: 'PORTFOLIO', transform: [1, 0, 0, 1, 0, 20] },
          { str: 'Finance Tracker FE', transform: [1, 0, 0, 1, 0, 10] }
        ]
      }),
      getAnnotations: jest.fn().mockResolvedValue([
        { url: 'https://github.com/example/fin-track-fe' },
        { url: 'https://github.com/example/fin-track-fe' }
      ])
    };

    await expect(renderPdfPageWithLinks(page)).resolves.toBe(
      'PORTFOLIO\nFinance Tracker FE\n\nEmbedded links:\nhttps://github.com/example/fin-track-fe'
    );
  });
});
