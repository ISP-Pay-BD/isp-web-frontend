'use client';

import { useState } from 'react';
import { formatBdtWithSymbol } from '@/lib/format';
import type { RoiData } from '../types';

interface RoiSectionProps {
  roi: RoiData;
}

export function RoiSection({ roi }: RoiSectionProps) {
  const [subscribers, setSubscribers] = useState<number | ''>(2500);
  const [currentCost, setCurrentCost] = useState<number | ''>(5000);

  const activeSubscribers = typeof subscribers === 'number' ? subscribers : 0;
  const activeCurrentCost = typeof currentCost === 'number' ? currentCost : 0;

  // Dynamic savings calculations
  // ISP Pay BD costs 500 base + 1.5 per sub on PAYG, or flat tier standard
  const estimatedIspPayBdMonthly = activeSubscribers > 0 ? 500 + activeSubscribers * 1.5 : 0;
  const hoursSavedMonthly = Math.round((activeSubscribers / 1000) * (roi?.hoursSavedPerDay || 2.5) * 30);
  const monthlyLaborSavings = hoursSavedMonthly * 250; // estimated 250 BDT/hr staff cost
  const directSoftwareSavings = Math.max(0, activeCurrentCost - estimatedIspPayBdMonthly);
  const netMonthlySavings = directSoftwareSavings + monthlyLaborSavings;
  const annualSavings = netMonthlySavings * 12;

  return (
    <section id="roi" className="border-t border-white/10 bg-landing-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
            ROI
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Calculate your monthly &amp; annual operational savings
          </h2>
          <p className="mt-4 text-base text-white/60">
            Staff hours and platform cost if you move reconciliation off spreadsheets.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-white/10 bg-landing-panel/60 p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <label htmlFor="subs-slider" className="font-semibold text-white">
                    Active Subscribers
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={subscribers}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSubscribers(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      className="w-24 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-right font-mono text-sm font-bold text-landing-accent focus:border-landing-cta focus:outline-none"
                    />
                    <span className="text-xs text-white/50 font-medium">lines</span>
                  </div>
                </div>
                <input
                  id="subs-slider"
                  type="range"
                  min="100"
                  max="10000"
                  step="50"
                  value={activeSubscribers || 100}
                  onChange={(e) => setSubscribers(Number(e.target.value))}
                  className="w-full accent-landing-cta cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-white/40 mt-1 font-mono">
                  <span>100</span>
                  <span>5,000</span>
                  <span>10,000+</span>
                </div>
              </div>

              <div>
                <label htmlFor="current-cost" className="block text-sm font-semibold text-white mb-2">
                  Current monthly software / manual cost (৳)
                </label>
                <div className="relative">
                  <input
                    id="current-cost"
                    type="number"
                    min="0"
                    step="500"
                    value={currentCost}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentCost(val === '' ? '' : Math.max(0, Number(val)));
                    }}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white focus:border-landing-cta focus:outline-none"
                  />
                  <span className="absolute right-4 top-3 font-mono text-sm text-white/40">BDT</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Staff Hours Saved / Month:</span>
                  <strong className="text-emerald-400 font-mono">~{hoursSavedMonthly} hours</strong>
                </div>
                <div className="flex justify-between">
                  <span>ISP Pay BD Monthly Estimate:</span>
                  <span className="font-mono text-white">{formatBdtWithSymbol(estimatedIspPayBdMonthly)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div>
                <p className="text-xs font-medium text-white/45">Estimated total savings</p>
                <div className="font-landing-display mt-3 text-4xl font-semibold tabular-nums text-white sm:text-5xl">
                  {formatBdtWithSymbol(annualSavings)}
                  <span className="text-lg font-normal text-white/50"> / year</span>
                </div>
                <p className="mt-2 font-mono text-sm text-white/60">
                  ≈ {formatBdtWithSymbol(netMonthlySavings)} / month
                </p>
              </div>

              <p className="mt-6 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/50">
                Recovered operator labor (less SMS cross-checking) plus lower platform overhead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
