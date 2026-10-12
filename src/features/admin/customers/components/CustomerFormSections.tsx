'use client';

import { useEffect, type ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Network, User, Calendar, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OptionSelect } from './OptionSelect';
import {
  useAreaOptions,
  usePackageOptions,
  usePppoeProfiles,
  useRouterOptions,
  useSubAreaOptions,
} from '../hooks/use-customers';
import {
  BILLING_STATUSES,
  CLIENT_TYPES,
  LINE_TYPES,
  PPPOE_SERVICES,
  type CustomerCreateValues,
} from '../schemas/customer.schema';

/** Both create and edit forms register a subset of these (snake_case) fields. */
type FormValues = CustomerCreateValues;

function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function useFieldError() {
  const { formState } = useFormContext<FormValues>();
  return (name: keyof FormValues) => {
    const e = formState.errors[name];
    return typeof e?.message === 'string' ? e.message : undefined;
  };
}

/** Bound select over an option list for a string form field. */
function SelectField({
  name,
  options,
  placeholder,
  disabled,
}: {
  name: keyof FormValues;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  const { control, setValue, formState } = useFormContext<FormValues>();
  const value = useWatch({ control, name }) as string | undefined;
  return (
    <OptionSelect
      value={value ?? ''}
      onChange={(v) => setValue(name, v as never, { shouldDirty: true, shouldValidate: true })}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      invalid={Boolean(formState.errors[name])}
      className="w-full"
    />
  );
}

export function ProfileSection() {
  const { register } = useFormContext<FormValues>();
  const err = useFieldError();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Personal Information
        </CardTitle>
        <CardDescription>Subscriber identity and contact details</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name *" error={err('name')}>
          <Input {...register('name')} autoComplete="off" />
        </Field>
        <Field label="Mobile Number *" error={err('mobile')}>
          <Input {...register('mobile')} inputMode="tel" autoComplete="off" />
        </Field>
        <Field label="Email Address" error={err('email')} hint="Optional — a placeholder is generated from the PPPoE username when empty.">
          <Input type="email" {...register('email')} autoComplete="off" />
        </Field>
        <Field label="NID Number" error={err('nid_number')}>
          <Input {...register('nid_number')} inputMode="numeric" autoComplete="off" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Installation Address *" error={err('address')}>
            <Input {...register('address')} autoComplete="off" />
          </Field>
        </div>
        <Field label="Account Status *" error={err('status')}>
          <SelectField
            name="status"
            placeholder="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

export function ServiceSection({ showExpiry = true }: { showExpiry?: boolean }) {
  const { control, register, setValue } = useFormContext<FormValues>();
  const err = useFieldError();
  const areaId = useWatch({ control, name: 'area_id' });
  const areas = useAreaOptions();
  const subAreas = useSubAreaOptions(areaId || undefined);
  const packages = usePackageOptions();
  const routers = useRouterOptions();

  // A sub-area belongs to one area — clear it when the area changes.
  const subAreaId = useWatch({ control, name: 'sub_area_id' });
  useEffect(() => {
    if (subAreaId && subAreas.data && !subAreas.data.some((s) => s.id === subAreaId)) {
      setValue('sub_area_id', '');
    }
  }, [subAreaId, subAreas.data, setValue]);

  const loading = (q: { isLoading: boolean; isError: boolean }, what: string) =>
    q.isLoading ? `Loading ${what}…` : q.isError ? `Could not load ${what}` : `Select ${what}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" /> Package & Network
        </CardTitle>
        <CardDescription>Plan, coverage area and MikroTik router</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Broadband Package *" error={err('package_id')}>
          <SelectField
            name="package_id"
            placeholder={loading(packages, 'package')}
            options={(packages.data ?? []).map((p) => ({ value: p.id, label: p.price !== null ? `${p.name} — ৳${p.price}` : p.name }))}
          />
        </Field>
        <Field label="Router *" error={err('router_id')}>
          <SelectField
            name="router_id"
            placeholder={loading(routers, 'router')}
            options={(routers.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
          />
        </Field>
        <Field label="Service Area *" error={err('area_id')}>
          <SelectField
            name="area_id"
            placeholder={loading(areas, 'area')}
            options={(areas.data ?? []).map((a) => ({ value: a.id, label: a.name }))}
          />
        </Field>
        <Field label="Sub-area" error={err('sub_area_id')}>
          <SelectField
            name="sub_area_id"
            placeholder={!areaId ? 'Select an area first' : loading(subAreas, 'sub-area')}
            disabled={!areaId || (subAreas.data?.length ?? 0) === 0}
            options={(subAreas.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
          />
        </Field>
        <Field label="Connection Type" error={err('connection_type')}>
          <SelectField name="connection_type" placeholder="Select type" options={LINE_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
        </Field>
        <Field label="Client Type" error={err('client_type')}>
          <SelectField name="client_type" placeholder="Select client type" options={CLIENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
        </Field>
        <Field label="Billing Status" error={err('billing_status')}>
          <SelectField name="billing_status" placeholder="Select billing status" options={BILLING_STATUSES.map((t) => ({ value: t.value, label: t.label }))} />
        </Field>
        {showExpiry && (
          <Field
            label="Expiry Date"
            error={err('will_expire')}
            hint="Leave empty to let the server compute it from the package cycle."
          >
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" className="pl-8" {...register('will_expire')} />
            </div>
          </Field>
        )}
      </CardContent>
    </Card>
  );
}

/** PPPoE secret fields. `create` needs all four; `edit` only allows changing the profile. */
export function PppoeSection({ mode }: { mode: 'create' | 'edit' }) {
  const { control, register } = useFormContext<FormValues>();
  const err = useFieldError();
  const routerId = useWatch({ control, name: 'router_id' });
  const profiles = usePppoeProfiles(routerId || undefined);

  const profilePlaceholder = !routerId
    ? 'Select a router first'
    : profiles.isLoading
      ? 'Loading router profiles…'
      : profiles.isError || profiles.data?.reachable === false
        ? 'Router unreachable'
        : 'Select profile';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" /> PPPoE Secret
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Created on the selected MikroTik router when the customer is saved.'
            : 'Change the bandwidth profile on the router (leave empty to keep the current one).'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {mode === 'create' && (
          <>
            <Field label="PPPoE Username *" error={err('pppoe_name')}>
              <Input className="font-mono" {...register('pppoe_name')} autoComplete="off" />
            </Field>
            <Field label="PPPoE Password *" error={err('pppoe_password')}>
              <Input type="password" className="font-mono" {...register('pppoe_password')} autoComplete="new-password" />
            </Field>
            <Field label="PPPoE Service *" error={err('pppoe_service')}>
              <SelectField name="pppoe_service" placeholder="Select service" options={PPPOE_SERVICES.map((s) => ({ value: s, label: s }))} />
            </Field>
          </>
        )}
        <Field label={mode === 'create' ? 'PPPoE Profile *' : 'PPPoE Profile'} error={err('pppoe_profile')}>
          <SelectField
            name="pppoe_profile"
            placeholder={profilePlaceholder}
            disabled={!routerId || (profiles.data?.profiles.length ?? 0) === 0}
            options={(profiles.data?.profiles ?? []).map((p) => ({ value: p, label: p }))}
          />
        </Field>
      </CardContent>
    </Card>
  );
}
