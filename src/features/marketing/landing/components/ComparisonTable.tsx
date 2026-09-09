'use client';

import { Check, X, ArrowLeftRight } from 'lucide-react';
import type { ComparisonRow } from '../types';

interface ComparisonTableProps {
  comparison: {
    headers: string[];
    rows: ComparisonRow[];
  };
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  return (
    <section id="comparison" className="border-t border-white/10 bg-landing-bg py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
            System Comparison
          </span>
          <h2 className="font-landing-display mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight text-white text-balance">
            The things you stop doing by hand
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Line-by-line against legacy billing panels — what changes the week you migrate.
          </p>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-white/45 md:hidden">
          <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
          Swipe to see full comparison
        </p>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto rounded-[calc(2rem-0.375rem)] bg-landing-panel p-4 md:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/45">
                  <th scope="col" className="py-4 pr-4 font-medium">
                    Capability
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-landing-cta">
                    ISP Pay BD
                  </th>
                  <th scope="col" className="py-4 pl-4 font-medium">
                    The panel you have now
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {comparison.rows.map((row) => (
                  <tr key={row.capability} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 font-medium text-white/90">{row.capability}</td>
                    <td className="px-4 py-4">
                      {row.us === true ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-white">
                          <Check className="h-4 w-4 text-landing-cta" aria-hidden />
                          Built-in
                        </span>
                      ) : (
                        <span className="text-white">{row.us}</span>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-white/45">
                      {row.legacy === 'Not available' ? (
                        <span className="inline-flex items-center gap-1.5 text-white/35">
                          <X className="h-4 w-4 text-rose-400/70" aria-hidden />
                          Not available
                        </span>
                      ) : (
                        <span>{row.legacy}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
