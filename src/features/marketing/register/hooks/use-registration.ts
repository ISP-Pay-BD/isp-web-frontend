'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import type { RegistrationFormData } from '../schemas/register.schema';
import type {
  PaygPlan,
  ReferralRegisterInput,
  ReferralValidation,
  RegisterIspResult,
  RegistrationPlans,
} from '../types';

type Raw = Record<string, unknown>;

function list(value: unknown): Raw[] {
  return Array.isArray(value) ? (value.filter((v) => v && typeof v === 'object') as Raw[]) : [];
}

function toPayg(value: unknown): PaygPlan | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Raw;
  return {
    id: str(p.id),
    name: str(p.name),
    baseFee: num(p.baseFee),
    perUserRate: num(p.perUserRate),
    minTopup: num(p.minTopup),
    trialDays: num(p.trialDays),
    addons: list(p.addons).map((a) => ({ key: str(a.key), name: str(a.name), price: num(a.price) })),
  };
}

/** Mapper for GET /v1/public/registration/plans. */
function toRegistrationPlans(value: unknown): RegistrationPlans {
  const r = camelizeKeys<Raw>(value) ?? {};
  return {
    plans: list(r.plans).map((p) => ({
      id: str(p.id),
      name: str(p.name),
      priceBdt: num(p.priceBdt),
      pricingType: str(p.pricingType),
      trialDays: num(p.trialDays),
      freeDays: num(p.freeDays),
      features: Array.isArray(p.features) ? p.features.map((f) => str(f)).filter(Boolean) : [],
    })),
    payg: toPayg(r.payg),
    allowSelfRegistration: r.allowSelfRegistration === true,
  };
}

function toReferralValidation(value: unknown): ReferralValidation {
  const r = camelizeKeys<Raw>(value) ?? {};
  return {
    valid: r.valid === true,
    code: str(r.code),
    referrerName: str(r.referrerName),
    ispName: str(r.ispName),
    packages: list(r.packages).map((p) => ({
      id: str(p.id),
      name: str(p.name),
      bandwidth: str(p.bandwidth),
      priceBdt: num(p.priceBdt),
    })),
  };
}

export function useRegistrationPlans() {
  return useQuery({
    queryKey: ['marketing', 'registration', 'plans'],
    queryFn: async ({ signal }) =>
      toRegistrationPlans(await http.get<unknown>('/v1/public/registration/plans', undefined, signal)),
  });
}

/** POST /v1/public/register-isp → 201 { message, plan_type, pending, trial_days, trial_ends_at }. */
export function useRegisterIsp() {
  return useMutation({
    // The form maps 422 field errors + toasts via handleApiError — skip the global toast.
    meta: { silent: true },
    mutationFn: async (form: RegistrationFormData): Promise<RegisterIspResult> => {
      const body = {
        organization_name: form.organization_name,
        admin_name: form.admin_name,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        nationalid: form.nationalid,
        division: form.division,
        district: form.district,
        upazilla: form.upazilla,
        address: form.address,
        package: form.package,
        customer_type: form.customer_type,
        reference_name: form.reference_name || undefined,
        reference_mobile: form.reference_mobile || undefined,
        custom_plan_note: form.package === 'custom' ? form.custom_plan_note : undefined,
        payg_addons: form.package === 'payg' && form.payg_addons?.length ? form.payg_addons : undefined,
      };
      const r = camelizeKeys<Raw>(await http.post<unknown>('/v1/public/register-isp', body)) ?? {};
      return {
        message: str(r.message),
        planType: str(r.planType),
        pending: r.pending === true,
        trialDays: num(r.trialDays),
        trialEndsAt: str(r.trialEndsAt) || null,
      };
    },
  });
}

/** GET /common/referral/validate/{code} — `{ valid: false }` for unknown codes. */
export function useReferralValidation(code: string) {
  return useQuery({
    queryKey: ['marketing', 'referral', 'validate', code],
    queryFn: async ({ signal }) =>
      toReferralValidation(
        await http.get<unknown>(`/common/referral/validate/${encodeURIComponent(code)}`, undefined, signal),
      ),
    enabled: code !== '',
    staleTime: 5 * 60_000,
  });
}

/** POST /common/register — creates a pending referral lead for the referrer's ISP. */
export function useReferralRegister() {
  return useMutation({
    // The form maps 422 field errors + toasts via handleApiError — skip the global toast.
    meta: { silent: true },
    mutationFn: async (input: ReferralRegisterInput) => {
      const r = await http.post<{ message?: unknown }>('/common/register', {
        name: input.name,
        mobile: input.mobile,
        email: input.email || undefined,
        nid_number: input.nidNumber || undefined,
        ref: input.ref,
        package_id: input.packageId ? Number(input.packageId) : undefined,
      });
      return { message: str(r?.message) };
    },
  });
}
