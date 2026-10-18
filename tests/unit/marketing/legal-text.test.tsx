import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LegalText } from '@/features/marketing/legal/components/LegalText';

const html = (body: string) => renderToStaticMarkup(<LegalText body={body} />);

describe('marketing/legal LegalText', () => {
  it('turns blank-line separated text into paragraphs and keeps single line breaks', () => {
    const out = html('First paragraph.\n\nSecond line one\nsecond line two');
    expect(out.match(/<p /g)).toHaveLength(2);
    expect(out).toContain('whitespace-pre-line');
    expect(out).toContain('Second line one\nsecond line two');
  });

  it('renders # / ## headings and - bullet lists', () => {
    const out = html('# Data we keep\n\n## Billing\n\n- name\n- mobile number');
    expect(out).toContain('<h2');
    expect(out).toContain('>Data we keep<');
    expect(out).toContain('<h3');
    expect(out).toContain('>Billing<');
    expect(out.match(/<li>/g)).toHaveLength(2);
  });

  it('never renders typed markup as HTML', () => {
    const out = html('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;script&gt;');
  });

  it('accepts Windows line endings', () => {
    expect(html('One\r\n\r\nTwo').match(/<p /g)).toHaveLength(2);
  });
});
