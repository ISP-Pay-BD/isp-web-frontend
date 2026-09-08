'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Rocket,
  Gift,
  Headset,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registrationSchema, type RegistrationFormData } from '../schemas/register.schema';
import { useTranslations } from '@/features/marketing/shared';
import { Reveal } from '@/components/motion/Reveal';

const divisionDistricts: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Faridpur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  Chattogram: ['Chattogram', "Cox's Bazar", 'Cumilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Noakhali', 'Lakshmipur', 'Bandarban', 'Khagrachari', 'Rangamati'],
  Rajshahi: ['Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'],
  Khulna: ['Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  Barishal: ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  Rangpur: ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
};

interface RegisterPageProps {
  initialReferralCode?: string;
  isReferralFlow?: boolean;
}

export function RegisterPage({ initialReferralCode = '', isReferralFlow = false }: RegisterPageProps) {
  const router = useRouter();
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('Dhaka');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      division: 'Dhaka',
      district: 'Dhaka',
      package: 'growth',
      customer_type: ['PPPOE', 'Static'],
      referral_code: initialReferralCode,
    },
  });

  const availableDistricts = divisionDistricts[selectedDivision] ?? [];

  const onSubmit = async (data: RegistrationFormData) => {
    setSubmitting(true);
    // Simulate tenant onboarding dispatch
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);

    toast.success('Account created successfully!', {
      description: `${data.organization_name} — your 14-day full platform trial is now active. Redirecting to login…`,
    });

    setTimeout(() => {
      router.push('/login?registered=1');
    }, 1200);
  };

  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Form */}
          <Reveal className="rounded-xl border border-white/10 bg-landing-panel/80 p-6 md:p-10 lg:col-span-8">
            <div className="mb-6 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
                  {isReferralFlow ? t('marketing.pages.register.referralBadge') : t('marketing.pages.register.badge')}
                </p>
                <h1 className="font-landing-display mt-2 text-2xl font-semibold text-white md:text-3xl">
                  {isReferralFlow ? t('marketing.pages.register.referralTitle') : t('marketing.pages.register.title')}
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  {isReferralFlow ? t('marketing.pages.register.referralSubtitle') : t('marketing.pages.register.subtitle')}
                </p>
              </div>
            </div>

            {isReferralFlow && (
              <div className="mb-6 rounded-xl border border-landing-cta/40 bg-landing-cta/10 p-4 text-xs text-white/90 flex items-center gap-3">
                <Gift className="h-5 w-5 text-landing-cta shrink-0" />
                <div>
                  <strong>Special Referral Offer Applied:</strong> You will receive an extended 30-day trial + ৳1,000 credit towards your first Pay-As-You-Grow wallet reload!
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-landing-accent">
                  01. ISP Organization Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Organization / Company Name *
                    </label>
                    <input
                      {...register('organization_name')}
                      placeholder="e.g. FastNet Broadband"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.organization_name && (
                      <p className="mt-1 text-xs text-red-400">{errors.organization_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Admin Full Name *
                    </label>
                    <input
                      {...register('admin_name')}
                      placeholder="Abdul Karim"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.admin_name && (
                      <p className="mt-1 text-xs text-red-400">{errors.admin_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Mobile Number (BD) *
                    </label>
                    <input
                      {...register('mobile')}
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none font-mono"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      National ID (NID) *
                    </label>
                    <input
                      {...register('nationalid')}
                      placeholder="NID 10/17 digit number"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none font-mono"
                    />
                    {errors.nationalid && (
                      <p className="mt-1 text-xs text-red-400">{errors.nationalid.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Admin Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="admin@ispcompany.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Password *
                    </label>
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="Min. 4 characters"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      {...register('confirm_password')}
                      type="password"
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-xs text-red-400">{errors.confirm_password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Geographic Location */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold tracking-wide text-landing-accent">
                  02. Area &amp; Coverage POP
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Division *
                    </label>
                    <select
                      {...register('division')}
                      onChange={(e) => {
                        setSelectedDivision(e.target.value);
                        setValue('division', e.target.value);
                        const firstDist = divisionDistricts[e.target.value]?.[0] ?? '';
                        setValue('district', firstDist);
                      }}
                      className="w-full rounded-xl border border-white/15 bg-landing-panel px-4 py-2.5 text-sm text-white focus:border-landing-cta focus:outline-none"
                    >
                      {Object.keys(divisionDistricts).map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      District *
                    </label>
                    <select
                      {...register('district')}
                      className="w-full rounded-xl border border-white/15 bg-landing-panel px-4 py-2.5 text-sm text-white focus:border-landing-cta focus:outline-none"
                    >
                      {availableDistricts.map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Upazilla / Thana *
                    </label>
                    <input
                      {...register('upazilla')}
                      placeholder="e.g. Uttara / Mirpur"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.upazilla && (
                      <p className="mt-1 text-xs text-red-400">{errors.upazilla.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      NOC / Office Street Address *
                    </label>
                    <input
                      {...register('address')}
                      placeholder="House, road, sector or village"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan & Customer Types */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold tracking-wide text-landing-accent">
                  03. Service Setup &amp; Plan
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Initial Plan *
                    </label>
                    <select
                      {...register('package')}
                      className="w-full rounded-xl border border-white/15 bg-landing-panel px-4 py-2.5 text-sm text-white focus:border-landing-cta focus:outline-none"
                    >
                      <option value="starter">Starter — Up to 500 Subscribers (৳2,999/mo after trial)</option>
                      <option value="growth">Growth — Up to 2,000 Subscribers (৳5,999/mo after trial)</option>
                      <option value="scale">Scale — Unlimited Subscribers (৳9,999/mo after trial)</option>
                      <option value="payg">Pay-As-You-Grow Wallet (৳1.5/subscriber, no monthly cap)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Customer Connection Types Handled *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {['PPPOE', 'Static', 'Hotspot'].map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                        >
                          <input
                            type="checkbox"
                            value={type}
                            {...register('customer_type')}
                            className="accent-landing-cta"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.customer_type && (
                      <p className="mt-1 text-xs text-red-400">{errors.customer_type.message}</p>
                    )}
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Referral Code (Optional)
                    </label>
                    <input
                      {...register('referral_code')}
                      placeholder="e.g. BD-ISP-77"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Reference Name / ISP Owner (Optional)
                    </label>
                    <input
                      {...register('reference_name')}
                      placeholder="Who recommended us?"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-landing-cta hover:bg-landing-cta-hover text-white h-12 text-base font-semibold shadow-[var(--shadow-primary)]"
                >
                  {submitting ? 'Creating Organization Account…' : 'Create Free Trial Account'}
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="text-center text-xs text-white/50 pt-2">
                Already have an operator account?{' '}
                <Link href="/login" className="text-landing-accent hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </Reveal>

          {/* Right Column: Trust & Highlights */}
          <Reveal className="space-y-6 lg:col-span-4" delay={0.06}>
            <div className="space-y-6 rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-landing-cta/30 bg-landing-cta/20 text-landing-cta">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-landing-display text-base font-bold text-white">
                    Launch Your ISP Platform
                  </h3>
                  <p className="text-xs text-white/50">14 days full access, zero lock-in</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-white/75">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Unlimited MikroTik router sync over RouterOS API</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Automated bKash &amp; Nagad payment reconciliation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Multi-POP reseller ledger with auto commission splits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Branded Bangla customer portal and Android self-care</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3">
                <Headset className="h-5 w-5 text-landing-accent" />
                <h4 className="font-landing-display text-sm font-bold text-white">
                  Need onboarding assistance?
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-white/70">
                Our Dhaka engineering team is ready to guide you through initial RouterOS API setup and subscriber Excel import over phone or remote AnyDesk session.
              </p>
              <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-xs">
                <span className="text-white/40">Hotline:</span>
                <span className="font-mono font-bold text-landing-cta">+880 1781-808231</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
