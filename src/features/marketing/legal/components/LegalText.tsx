import type { ReactNode } from 'react';

/**
 * Renders the plain-text legal documents the platform owner writes in the software settings.
 * Blank lines separate blocks; `# ` / `## ` start a heading, `- ` lines a bullet list. Text is
 * always rendered as text (never as HTML), so nothing typed there can inject markup.
 */
export function LegalText({ body }: { body: string }) {
  const blocks: ReactNode[] = [];

  body
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .forEach((block, index) => {
      const lines = block.split('\n');

      if (lines.every((line) => /^[-*] /.test(line))) {
        blocks.push(
          <ul key={index} className="list-disc space-y-1.5 pl-6 text-white/75">
            {lines.map((line, i) => (
              <li key={i}>{line.slice(2)}</li>
            ))}
          </ul>,
        );
        return;
      }

      const heading = lines[0].match(/^(#{1,2}) (.+)$/);
      if (heading) {
        const Tag = heading[1].length === 1 ? 'h2' : 'h3';
        blocks.push(
          <Tag
            key={index}
            className={
              Tag === 'h2'
                ? 'font-landing-display pt-4 text-2xl font-semibold tracking-tight text-white'
                : 'pt-2 text-lg font-semibold text-white'
            }
          >
            {heading[2]}
          </Tag>,
        );
        if (lines.length > 1) {
          blocks.push(
            <p key={`${index}-rest`} className="whitespace-pre-line text-white/75">
              {lines.slice(1).join('\n')}
            </p>,
          );
        }
        return;
      }

      blocks.push(
        <p key={index} className="whitespace-pre-line text-white/75">
          {block}
        </p>,
      );
    });

  return <div className="space-y-5 text-[15px] leading-relaxed">{blocks}</div>;
}
