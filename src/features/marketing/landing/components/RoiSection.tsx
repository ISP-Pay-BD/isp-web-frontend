'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';
import type { RoiData } from '../types';

interface RoiSectionProps {
  roi: RoiData;
}

export function RoiSection({ roi }: RoiSectionProps) {
  const [subscribers, setSubscribers] = useState(2500);
  const [currentCost, setCurrentCost] = useState(5000);

  // Dynamic savings calculations
  // ISP Pay BD costs 500 base + 1.5 per sub on PAYG, or flat tier standard
  const estimatedIspPayBdMonthly = 500 + subscribers * 1.5;
  const hoursSavedMonthly = Math.round((subscribers / 1000) * roi.hoursSavedPerDay * 30);
  const monthlyLaborSavings = hoursSavedMonthly * 250; // estimated 250 BDT/hr staff cost
  const directSoftwareSavings = Math.max(0, currentCost - estimatedIspPayBdMonthly);
  const netMonthlySavings = directSoftwareSavings + monthlyLaborSavings;
  const annualSavings = netMonthlySavings * 12;

  return (
    <section id="roi" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            ROI Calculator
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Calculate your monthly &amp; annual operational savings
          </h2>
          <p className="mt-4 text-base text-white/70">
            See how much your ISP saves in staff hours and platform costs by switching to automated reconciliation.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-landing-panel/80 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <label htmlFor="subs-slider" className="font-semibold text-white">
                    Active Subscribers
                  </label>
                  <span className="font-mono text-base font-bold text-landing-accent">
                    {subscribers.toLocaleString()} lines
                  </span>
                </div>
                <input
                  id="subs-slider"
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={subscribers}
                  onChange={(e) => setSubscribers(Number(e.target.value))}
                  className="w-full accent-landing-cta cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-white/40 mt-1 font-mono">
                  <span>200</span>
                  <span>5,000</span>
                  <span>10,000</span>
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
                    min="1000"
                    step="500"
                    value={currentCost}
                    onChange={(e) => setCurrentCost(Number(e.target.value))}
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

            {/* Calculated Result Card */}
            <div className="flex flex-col justify-between rounded-xl border border-landing-cta/40 bg-landing-cta/5 p-6 text-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-landing-cta inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Estimated Total Savings
                </span>
                <div className="font-landing-display mt-4 text-4xl sm:text-5xl font-extrabold text-white">
                  {formatBdtWithSymbol(annualSavings)}
                  <span className="text-lg font-normal text-white/60"> / year</span>
                </div>
                <p className="mt-2 font-mono text-sm text-emerald-400">
                  ≈ {formatBdtWithSymbol(netMonthlySavings)} saved every month
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/60 leading-relaxed">
                Includes recovered operator labor time (eliminated manual SMS cross-checking) + lowered platform overhead.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
