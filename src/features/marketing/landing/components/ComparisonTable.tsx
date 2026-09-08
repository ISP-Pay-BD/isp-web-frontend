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
    <section id="comparison" className="border-t border-white/10 bg-landing-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
            Comparison
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The things you stop doing by hand
          </h2>
          <p className="mt-4 text-base text-white/60">
            Line-by-line against legacy billing panels — what changes the week you migrate.
          </p>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-white/45 md:hidden">
          <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
          Swipe to see full comparison
        </p>

        <div className="mt-10 overflow-x-auto border-y border-white/10">
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
                <tr key={row.capability}>
                  <td className="py-4 pr-4 font-medium text-white/90">{row.capability}</td>
                  <td className="px-4 py-4">
                    {row.us === true ? (
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Check className="h-4 w-4 text-landing-cta" aria-hidden />
                        Built-in
                      </span>
                    ) : (
                      <span className="text-white">{row.us}</span>
                    )}
                  </td>
                  <td className="py-4 pl-4 text-white/45">
                    {row.legacy === 'Not available' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <X className="h-4 w-4" aria-hidden />
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
    </section>
  );
}
