'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Rocket, Headset, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol, formatCount, formatDate } from '@/lib/format';
import { registrationSchema, type RegistrationFormData } from '../schemas/register.schema';
import { useRegisterIsp, useRegistrationPlans } from '../hooks/use-registration';
import { ReferralRegisterForm } from '../components/ReferralRegisterForm';
import { useLocale, useTranslations } from '@/features/marketing/shared';
import { Reveal } from '@/components/motion/Reveal';
import type { RegisterIspResult, RegistrationPlans } from '../types';

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

/** Connection protocols the backend accepts for `customer_type[]`. */
const CUSTOMER_TYPES = ['PPPOE', 'Static', 'Hotspot'] as const;

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none';
const selectClass =
  'w-full rounded-xl border border-white/15 bg-landing-panel px-4 py-2.5 text-sm text-white focus:border-landing-cta focus:outline-none';
const labelClass = 'block text-xs font-semibold text-white/80 mb-1';

const placeKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

type Translate = ReturnType<typeof useTranslations>;

/** Plan periods come from the API as free text: known ones are translated, anything else is shown as given. */
function periodLabel(t: Translate, pricingType: string): string {
  switch (pricingType.toLowerCase().replace(/[^a-z]/g, '')) {
    case 'month':
    case 'monthly':
      return t('marketing.register.period.month', pricingType);
    case 'year':
    case 'yearly':
    case 'annual':
      return t('marketing.register.period.year', pricingType);
    case 'week':
    case 'weekly':
      return t('marketing.register.period.week', pricingType);
    default:
      return pricingType;
  }
}

interface RegisterPageProps {
  initialReferralCode?: string;
  isReferralFlow?: boolean;
}

export function RegisterPage({ initialReferralCode = '', isReferralFlow = false }: RegisterPageProps) {
  if (isReferralFlow) return <ReferralRegisterForm initialCode={initialReferralCode} />;
  return <IspRegisterPage />;
}

function IspRegisterPage() {
  const t = useTranslations();
  const plansQuery = useRegistrationPlans();
  const [result, setResult] = useState<RegisterIspResult | null>(null);

  return (
    <div className="pt-32 pb-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Form */}
          <Reveal className="rounded-xl border border-white/10 bg-landing-panel/80 p-6 md:p-10 lg:col-span-8">
            <div className="mb-6 border-b border-white/10 pb-6">
              <p className="text-xs font-medium tracking-[0.08em] text-landing-accent">
                {t('marketing.pages.register.badge')}
              </p>
              <h1 className="font-landing-display mt-2 text-2xl font-semibold text-white md:text-3xl">
                {t('marketing.pages.register.title')}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                {t(
                  'marketing.register.subtitle',
                  'Set up your ISP organization — connect MikroTik, import subscribers and reconcile bKash payments.',
                )}
              </p>
            </div>

            {result ? (
              <SuccessPanel result={result} />
            ) : plansQuery.isLoading ? (
              <p className="py-10 text-center text-sm text-white/50">
                {t('marketing.register.loading', 'Loading registration options…')}
              </p>
            ) : plansQuery.isError || !plansQuery.data ? (
              <div className="py-10 text-center">
                <p className="text-sm text-white/70">
                  {t('marketing.register.loadFailed', "Couldn't load registration options.")}
                </p>
                <button
                  type="button"
                  onClick={() => plansQuery.refetch()}
                  className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : !plansQuery.data.allowSelfRegistration ? (
              <ClosedNotice />
            ) : (
              <IspRegisterForm
                options={plansQuery.data}
                onRegistered={setResult}
                onClosed={() => plansQuery.refetch()}
              />
            )}
          </Reveal>

          {/* Right Column */}
          <Reveal className="space-y-6 lg:col-span-4" delay={0.06}>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3">
                <Headset className="h-5 w-5 text-landing-accent" />
                <h4 className="font-landing-display text-sm font-bold text-white">
                  {t('marketing.register.helpTitle', 'Need onboarding assistance?')}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-white/70">
                {t(
                  'marketing.register.helpBody',
                  'Our team can guide you through RouterOS API setup and importing your existing subscribers.',
                )}
              </p>
              <Link href="/contact" className="mt-4 inline-block text-xs font-medium text-landing-accent hover:underline">
                {t('marketing.register.contact', 'Contact us')}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function ClosedNotice() {
  const t = useTranslations();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-landing-accent" />
      <div>
        <p className="font-semibold text-white">
          {t('marketing.register.closedTitle', 'Self-registration is currently closed')}
        </p>
        <p className="mt-1 text-white/60">
          {t(
            'marketing.register.closedBody',
            "New ISP accounts are being set up by our team for now. Get in touch and we'll help you get started.",
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <Link href="/contact" className="font-medium text-landing-accent hover:underline">
            {t('marketing.register.contact', 'Contact us')}
          </Link>
          <Link href="/login" className="text-white/60 hover:underline">
            {t('marketing.register.signIn', 'Sign in')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuccessPanel({ result }: { result: RegisterIspResult }) {
  const t = useTranslations();
  const trialEnds = result.trialEndsAt
    ? Number.isNaN(new Date(result.trialEndsAt).getTime())
      ? result.trialEndsAt
      : formatDate(result.trialEndsAt)
    : null;

  return (
    <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-white/90">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            {result.message || t('marketing.register.referral.received', 'Registration received.')}
          </p>
          {trialEnds ? (
            <p className="text-xs text-white/60">
              {t('marketing.register.trialEnds', 'Trial ends {date}', { date: trialEnds })}
            </p>
          ) : null}
        </div>
      </div>
      <Button className="bg-landing-cta hover:bg-landing-cta-hover text-white" render={<Link href="/login?registered=1" />}>
        {t('marketing.register.goToSignIn', 'Go to sign in')}
      </Button>
    </div>
  );
}

function IspRegisterForm({
  options,
  onRegistered,
  onClosed,
}: {
  options: RegistrationPlans;
  onRegistered: (result: RegisterIspResult) => void;
  onClosed: () => void;
}) {
  const t = useTranslations();
  const registerIsp = useRegisterIsp();
  const place = (name: string) => t(`marketing.register.place.${placeKey(name)}`, name);
  const customerTypeLabel = (type: string) =>
    type === 'Static'
      ? t('marketing.register.typeStatic', 'Static')
      : type === 'Hotspot'
        ? t('marketing.register.typeHotspot', 'Hotspot')
        : type;
  const [selectedDivision, setSelectedDivision] = useState('Dhaka');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      division: 'Dhaka',
      district: 'Dhaka',
      package: '',
      customer_type: ['PPPOE'],
      payg_addons: [],
    },
  });

  const selectedPackage = useWatch({ control, name: 'package' });
  const availableDistricts = divisionDistricts[selectedDivision] ?? [];

  const onSubmit = (data: RegistrationFormData) => {
    registerIsp.mutate(data, {
      onSuccess: (res) => {
        toast.success(res.message || t('marketing.register.referral.received', 'Registration received.'));
        onRegistered(res);
      },
      onError: (err) => {
        handleApiError(err, setError, t('marketing.pluginDetail.sendFailed', 'Something went wrong. Please try again.'));
        if (err.code === 'REGISTRATION_CLOSED') onClosed();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Organization Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-landing-accent">{t('marketing.register.sectionOrg', '01. ISP Organization Details')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t('marketing.register.orgName', 'Organization / Company Name *')}</label>
            <input
              {...register('organization_name')}
              placeholder={t('marketing.register.orgNamePlaceholder', "Your ISP's registered name")}
              className={inputClass}
            />
            <FieldError message={errors.organization_name?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.adminName', 'Admin Full Name *')}</label>
            <input {...register('admin_name')} autoComplete="name" className={inputClass} />
            <FieldError message={errors.admin_name?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.mobile', 'Mobile Number (BD) *')}</label>
            <input {...register('mobile')} inputMode="tel" placeholder="017XXXXXXXX" className={`${inputClass} font-mono`} />
            <FieldError message={errors.mobile?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.nid', 'National ID (NID) *')}</label>
            <input
              {...register('nationalid')}
              placeholder={t('marketing.register.nidPlaceholder', 'NID 10/17 digit number')}
              className={`${inputClass} font-mono`}
            />
            <FieldError message={errors.nationalid?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.adminEmail', 'Admin Email *')}</label>
            <input {...register('email')} type="email" autoComplete="email" className={inputClass} />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.password', 'Password *')}</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder={t('marketing.register.passwordPlaceholder', 'Min. 4 characters')}
              className={inputClass}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.confirmPassword', 'Confirm Password *')}</label>
            <input
              {...register('confirm_password')}
              type="password"
              autoComplete="new-password"
              placeholder={t('marketing.register.confirmPasswordPlaceholder', 'Repeat password')}
              className={inputClass}
            />
            <FieldError message={errors.confirm_password?.message} />
          </div>
        </div>
      </div>

      {/* Geographic Location */}
      <div className="space-y-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold tracking-wide text-landing-accent">{t('marketing.register.sectionArea', '02. Area & Coverage POP')}</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{t('marketing.register.division', 'Division *')}</label>
            <select
              {...register('division')}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setValue('division', e.target.value);
                setValue('district', divisionDistricts[e.target.value]?.[0] ?? '');
              }}
              className={selectClass}
            >
              {Object.keys(divisionDistricts).map((div) => (
                <option key={div} value={div}>
                  {place(div)}
                </option>
              ))}
            </select>
            <FieldError message={errors.division?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.district', 'District *')}</label>
            <select {...register('district')} className={selectClass}>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {place(dst)}
                </option>
              ))}
            </select>
            <FieldError message={errors.district?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.upazilla', 'Upazilla / Thana *')}</label>
            <input {...register('upazilla')} className={inputClass} />
            <FieldError message={errors.upazilla?.message} />
          </div>

          <div className="sm:col-span-3">
            <label className={labelClass}>{t('marketing.register.address', 'NOC / Office Street Address *')}</label>
            <input
              {...register('address')}
              placeholder={t('marketing.register.addressPlaceholder', 'House, road, sector or village')}
              className={inputClass}
            />
            <FieldError message={errors.address?.message} />
          </div>
        </div>
      </div>

      {/* Plan & Customer Types */}
      <div className="space-y-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold tracking-wide text-landing-accent">{t('marketing.register.sectionPlan', '03. Service Setup & Plan')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t('marketing.register.plan', 'Plan *')}</label>
            <select {...register('package')} className={selectClass}>
              <option value="">{t('marketing.register.choosePlan', 'Choose a plan')}</option>
              {options.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatBdtWithSymbol(p.priceBdt)} / {periodLabel(t, p.pricingType || 'month')}
                  {p.freeDays > 0
                    ? ` · ${t('marketing.register.daysFree', '{n} days free', { n: formatCount(p.freeDays) })}`
                    : ''}
                </option>
              ))}
              {options.payg ? (
                <option value="payg">
                  {t('marketing.register.paygOption', '{name} — pay as you go', {
                    name: options.payg.name || t('marketing.register.paygName', 'Pay-As-You-Go'),
                  })}
                </option>
              ) : null}
              <option value="custom">{t('marketing.register.customOption', 'Custom plan — tell us what you need')}</option>
            </select>
            <FieldError message={errors.package?.message} />
            <PlanSummary options={options} selected={selectedPackage} />
          </div>

          {selectedPackage === 'payg' && options.payg && options.payg.addons.length > 0 ? (
            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold text-white/80">
                {t('marketing.register.addons', 'Optional add-ons')}
              </span>
              <div className="flex flex-wrap gap-3">
                {options.payg.addons.map((addon) => (
                  <label
                    key={addon.key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                  >
                    <input type="checkbox" value={addon.key} {...register('payg_addons')} className="accent-landing-cta" />
                    <span>
                      {addon.name} (+{formatBdtWithSymbol(addon.price)})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {selectedPackage === 'custom' ? (
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('marketing.register.customNeed', 'What do you need? *')}</label>
              <textarea
                {...register('custom_plan_note')}
                rows={3}
                placeholder={t(
                  'marketing.register.customNeedPlaceholder',
                  'Expected subscriber count, branches, white label, budget…',
                )}
                className={inputClass}
              />
              <FieldError message={errors.custom_plan_note?.message} />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-white/80">
              {t('marketing.register.connectionTypes', 'Customer Connection Types Handled *')}
            </span>
            <div className="flex flex-wrap gap-4">
              {CUSTOMER_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  <input type="checkbox" value={type} {...register('customer_type')} className="accent-landing-cta" />
                  <span>{customerTypeLabel(type)}</span>
                </label>
              ))}
            </div>
            <FieldError message={errors.customer_type?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.referenceName', 'Reference Name (Optional)')}</label>
            <input
              {...register('reference_name')}
              placeholder={t('marketing.register.referenceNamePlaceholder', 'Who recommended us?')}
              className={inputClass}
            />
            <FieldError message={errors.reference_name?.message} />
          </div>

          <div>
            <label className={labelClass}>{t('marketing.register.referenceMobile', 'Reference Mobile (Optional)')}</label>
            <input {...register('reference_mobile')} inputMode="tel" className={`${inputClass} font-mono`} />
            <FieldError message={errors.reference_mobile?.message} />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          disabled={registerIsp.isPending}
          className="h-12 w-full bg-landing-cta text-base font-semibold text-white shadow-[var(--shadow-primary)] hover:bg-landing-cta-hover"
        >
          {registerIsp.isPending
            ? t('marketing.register.creating', 'Creating Organization Account…')
            : t('marketing.register.create', 'Create Account')}
          <Rocket className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="pt-2 text-center text-xs text-white/50">
        {t('marketing.register.haveAccount', 'Already have an operator account?')}{' '}
        <Link href="/login" className="font-medium text-landing-accent hover:underline">
          {t('marketing.register.signInHere', 'Sign in here')}
        </Link>
      </div>
    </form>
  );
}

/** What the selected plan includes — straight from the plans endpoint. */
function PlanSummary({ options, selected }: { options: RegistrationPlans; selected: string }) {
  const t = useTranslations();
  const trial = (days: number) =>
    ` · ${t('marketing.register.trialDays', '{n}-day trial', { n: formatCount(days) })}`;
  const plan = options.plans.find((p) => p.id === selected);
  const payg = selected === 'payg' ? options.payg : null;

  if (!plan && !payg && selected !== 'custom') return null;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/75">
      {plan ? (
        <>
          <p className="text-white/90">
            <span className="font-semibold">{plan.name}</span> · {formatBdtWithSymbol(plan.priceBdt)}
            {plan.pricingType ? ` / ${periodLabel(t, plan.pricingType)}` : ''}
            {plan.trialDays > 0 ? trial(plan.trialDays) : ''}
          </p>
          {plan.features.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : payg ? (
        <p>
          {t(
            'marketing.register.paygSummary',
            'Base fee {base} · {rate} per subscriber · minimum top-up {min}',
            {
              base: formatBdtWithSymbol(payg.baseFee),
              rate: formatBdtWithSymbol(payg.perUserRate),
              min: formatBdtWithSymbol(payg.minTopup),
            },
          )}
          {payg.trialDays > 0 ? trial(payg.trialDays) : ''}
        </p>
      ) : (
        <p>
          {t(
            'marketing.register.customSummary',
            'Describe what you need below and our team will get back to you with a quote.',
          )}
        </p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  const { te } = useLocale();
  return message ? <p className="mt-1 text-xs text-red-400">{te(message)}</p> : null;
}
