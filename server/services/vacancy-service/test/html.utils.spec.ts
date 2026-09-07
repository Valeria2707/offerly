import { extractReadableJobPage } from '../src/utils/html.utils';

describe('extractReadableJobPage', () => {
  it('keeps visible and structured job data while removing scripts and navigation', () => {
    const html =
      '<html><head><title>Backend Engineer</title><script type="application/ld+json">{"@type":"JobPosting","hiringOrganization":{"name":"Offerly"}}</script><script>alert(1)</script></head><body><nav>Menu</nav><main>Build APIs with NestJS</main></body></html>';
    const content = extractReadableJobPage(html);
    expect(content).toContain('Backend Engineer');
    expect(content).toContain('Build APIs with NestJS');
    expect(content).toContain('JobPosting');
    expect(content).not.toContain('alert(1)');
    expect(content).not.toContain('Menu');
  });
});
