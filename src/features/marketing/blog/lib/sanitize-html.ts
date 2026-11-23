/**
 * Blog content is HTML written by the platform owner. Before it is rendered publicly, drop anything
 * that can run script: executable / embedding elements, `on*` handlers, and `javascript:` / `data:` URLs
 * (except `data:image/*` in `src`). Browser-only (DOMParser); on the server it returns plain text.
 */
const BLOCKED =
  'script,style,iframe,object,embed,link,meta,base,form,input,button,textarea,select,frame,frameset,noscript,template,svg,math';
const URL_ATTRS = ['href', 'src', 'xlink:href', 'action', 'formaction', 'srcset', 'poster'];

function unsafeUrl(name: string, value: string): boolean {
  const v = value.replace(/[\u0000- ]/g, '').toLowerCase();
  if (v.startsWith('javascript:') || v.startsWith('vbscript:')) return true;
  if (v.startsWith('data:')) return !(name === 'src' && v.startsWith('data:image/'));
  return false;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Posts written as plain text (no tags) become paragraphs; HTML posts are sanitized. */
export function blogContentHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return sanitizeHtml(content);
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.body.querySelectorAll(BLOCKED).forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (
        name.startsWith('on') ||
        name === 'style' ||
        (URL_ATTRS.includes(name) && unsafeUrl(name, attr.value))
      ) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === 'A') {
      el.setAttribute('rel', 'noopener noreferrer nofollow');
      if (/^https?:/i.test(el.getAttribute('href') ?? '')) el.setAttribute('target', '_blank');
    }
  });
  return doc.body.innerHTML;
}
