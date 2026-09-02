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
    <section id="comparison" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            The Delta
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            The things you stop doing by hand
          </h2>
          <p className="mt-4 text-base text-white/70">
            Line-by-line against legacy billing panels or generic CRMs — what actually changes the week you migrate.
          </p>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/50 md:hidden">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Swipe table to view full comparison
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/15 bg-landing-panel/60 backdrop-blur-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <th scope="col" className="p-5 font-semibold">
                  Capability
                </th>
                <th scope="col" className="p-5 font-bold text-landing-cta bg-landing-cta/10">
                  ISP Pay BD
                </th>
                <th scope="col" className="p-5 font-semibold text-white/60">
                  The panel you have now
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparison.rows.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-white/[0.02]">
                  <td className="p-5 font-medium text-white/90">
                    {row.capability}
                  </td>
                  <td className="p-5 bg-landing-cta/5">
                    {row.us === true ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                        <Check className="h-4 w-4" />
                        Built-in
                      </span>
                    ) : (
                      <span className="text-white">{row.us}</span>
                    )}
                  </td>
                  <td className="p-5 text-white/50">
                    {row.legacy === 'Not available' ? (
                      <span className="inline-flex items-center gap-1.5 text-rose-400">
                        <X className="h-4 w-4" />
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
