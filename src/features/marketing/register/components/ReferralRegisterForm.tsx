'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, Gift, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol } from '@/lib/format';
import {
  referralRegistrationSchema,
  type ReferralRegistrationFormData,
} from '../schemas/referral.schema';
import { useReferralRegister, useReferralValidation } from '../hooks/use-registration';

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none';
const labelClass = 'block text-xs font-semibold text-white/80 mb-1';

const normalizeCode = (value: string) => value.trim().toUpperCase();

/** Customer referral lead: a subscriber's code → their ISP finishes the account setup. */
export function ReferralRegisterForm({ initialCode }: { initialCode: string }) {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const registerLead = useReferralRegister();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReferralRegistrationFormData>({
    resolver: zodResolver(referralRegistrationSchema),
    defaultValues: { ref: initialCode, name: '', mobile: '', email: '', nid_number: '', package_id: '' },
  });

  // Validate the code on load (when present), debounced while typing, and immediately on blur.
  const refValue = useWatch({ control, name: 'ref' }) ?? '';
  const [checkCode, setCheckCode] = useState(() => normalizeCode(initialCode));
  useEffect(() => {
    const id = setTimeout(() => setCheckCode(normalizeCode(refValue)), 500);
    return () => clearTimeout(id);
  }, [refValue]);

  // Packages belong to the referrer's ISP — drop a stale pick when the code changes.
  useEffect(() => {
    setValue('package_id', '');
  }, [checkCode, setValue]);

  const validation = useReferralValidation(checkCode);
  const info = validation.data;
  const codeInvalid = checkCode !== '' && info?.valid === false;
  const packages = info?.valid ? info.packages : [];

  const onSubmit = (values: ReferralRegistrationFormData) => {
    if (codeInvalid) {
      setError('ref', { type: 'validate', message: 'This referral code is not valid.' });
      return;
    }
    registerLead.mutate(
      {
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
        nidNumber: values.nid_number || undefined,
        ref: normalizeCode(values.ref),
        packageId: values.package_id || undefined,
      },
      {
        onSuccess: (res) => {
          const message = res.message || 'Registration received.';
          toast.success(message);
          setSentMessage(message);
        },
        onError: (err) => {
          handleApiError(err, setError);
        },
      },
    );
  };

  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Reveal className="rounded-xl border border-white/10 bg-landing-panel/80 p-6 md:p-10">
          <div className="mb-6 border-b border-white/10 pb-6">
            <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">Customer referral</p>
            <h1 className="font-landing-display mt-2 text-2xl font-semibold text-white md:text-3xl">
              Get connected with a referral code
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Share your details and the ISP that referred you will review them and finish setting up your connection.
            </p>
          </div>

          {sentMessage ? (
            <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-white/90">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="font-semibold text-white">{sentMessage}</p>
              </div>
              <Link href="/" className="inline-block text-xs font-medium text-landing-accent hover:underline">
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label className={labelClass}>Referral code *</label>
                <input
                  {...register('ref', {
                    onBlur: () => setCheckCode(normalizeCode(getValues('ref') ?? '')),
                    onChange: () => clearErrors('ref'),
                  })}
                  autoCapitalize="characters"
                  className={`${inputClass} font-mono uppercase`}
                />
                {errors.ref?.message ? (
                  <p className="mt-1 text-xs text-red-400">{errors.ref.message}</p>
                ) : checkCode === '' ? null : validation.isFetching && !info ? (
                  <p className="mt-1 text-xs text-white/50">Checking code…</p>
                ) : validation.isError ? (
                  <p className="mt-1 text-xs text-amber-300">
                    Couldn&apos;t verify the code.{' '}
                    <button type="button" className="underline" onClick={() => validation.refetch()}>
                      Retry
                    </button>
                  </p>
                ) : codeInvalid ? (
                  <p className="mt-1 text-xs text-red-400">This referral code is not valid.</p>
                ) : info?.valid ? (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-landing-cta/40 bg-landing-cta/10 px-3 py-2 text-xs text-white/90">
                    <Gift className="h-4 w-4 shrink-0 text-landing-cta" />
                    <span>
                      Referred by <strong>{info.referrerName || 'a subscriber'}</strong>
                      {info.ispName ? (
                        <>
                          {' '}
                          on <strong>{info.ispName}</strong>
                        </>
                      ) : null}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full name *</label>
                  <input {...register('name')} autoComplete="name" className={inputClass} />
                  {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label className={labelClass}>Mobile number (BD) *</label>
                  <input
                    {...register('mobile')}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="017XXXXXXXX"
                    className={`${inputClass} font-mono`}
                  />
                  {errors.mobile ? <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p> : null}
                </div>

                <div>
                  <label className={labelClass}>Email (optional)</label>
                  <input {...register('email')} type="email" autoComplete="email" className={inputClass} />
                  {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
                </div>

                <div>
                  <label className={labelClass}>National ID (optional)</label>
                  <input {...register('nid_number')} className={`${inputClass} font-mono`} />
                  {errors.nid_number ? (
                    <p className="mt-1 text-xs text-red-400">{errors.nid_number.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className={labelClass}>Package (optional)</label>
                  <select
                    {...register('package_id')}
                    disabled={packages.length === 0}
                    className="w-full rounded-xl border border-white/15 bg-landing-panel px-4 py-2.5 text-sm text-white focus:border-landing-cta focus:outline-none disabled:opacity-60"
                  >
                    <option value="">
                      {packages.length === 0 ? 'Enter a valid code to see packages' : 'No preference'}
                    </option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.bandwidth ? ` · ${p.bandwidth}` : ''} — {formatBdtWithSymbol(p.priceBdt)}
                      </option>
                    ))}
                  </select>
                  {errors.package_id ? (
                    <p className="mt-1 text-xs text-red-400">{errors.package_id.message}</p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerLead.isPending}
                className="h-12 w-full bg-landing-cta text-base font-semibold text-white shadow-[var(--shadow-primary)] hover:bg-landing-cta-hover"
              >
                {registerLead.isPending ? 'Submitting…' : 'Submit registration'}
                <UserPlus className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
