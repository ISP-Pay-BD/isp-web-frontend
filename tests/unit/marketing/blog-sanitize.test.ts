import { describe, expect, it } from 'vitest';
import { blogContentHtml, sanitizeHtml } from '@/features/marketing/blog/lib/sanitize-html';

describe('blog content sanitizing', () => {
  it('drops scripts, event handlers and javascript: links', () => {
    const out = sanitizeHtml(
      '<p onclick="steal()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="x" onerror="boom()"><iframe src="https://evil"></iframe>',
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|iframe/i);
    expect(out).toContain('<p>Hi</p>');
  });

  it('keeps ordinary formatting and opens external links safely', () => {
    const out = sanitizeHtml(
      '<h2>Title</h2><ul><li>One</li></ul><a href="https://ispbd.com">site</a>',
    );
    expect(out).toContain('<h2>Title</h2>');
    expect(out).toContain('<li>One</li>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it('turns plain-text posts into escaped paragraphs', () => {
    expect(blogContentHtml('a\nb\n\nc')).toBe('<p>a<br>b</p><p>c</p>');
    expect(blogContentHtml('1 < 2 & 3 > 2')).toBe('<p>1 &lt; 2 &amp; 3 &gt; 2</p>');
  });
});
