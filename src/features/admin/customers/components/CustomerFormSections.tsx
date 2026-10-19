'use client';

import { Children, cloneElement, isValidElement, useEffect, useId, type ReactElement, type ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Network, User, Calendar, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n/locale-context';
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

function Field({ label, error, children, hint, htmlFor }: { label: string; error?: string; children: ReactNode; hint?: string; htmlFor?: string }) {
  // The label and the control share one generated id, so the control has an accessible name.
  const generatedId = useId();
  const kids = Children.toArray(children);
  const controlIndex = kids.findIndex(isValidElement);
  const control = kids[controlIndex] as ReactElement<{ id?: string }> | undefined;
  const controlId = htmlFor ?? control?.props.id ?? generatedId;
  const content = kids.map((child, i) =>
    !htmlFor && i === controlIndex && control && !control.props.id ? cloneElement(control, { id: generatedId }) : child,
  );
  return (
    <div className="space-y-1.5">
      <Label htmlFor={controlId} className="text-sm">{label}</Label>
      {content}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function useFieldError() {
  const { formState } = useFormContext<FormValues>();
  const { te } = useLocale();
  return (name: keyof FormValues) => {
    const e = formState.errors[name];
    return typeof e?.message === 'string' ? te(e.message) : undefined;
  };
}

/** Bound select over an option list for a string form field. */
function SelectField({
  id,
  name,
  options,
  placeholder,
  disabled,
}: {
  id?: string;
  name: keyof FormValues;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  const { control, setValue, formState } = useFormContext<FormValues>();
  const value = useWatch({ control, name }) as string | undefined;
  return (
    <OptionSelect
      id={id}
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
  const t = useTranslations();
  const { register } = useFormContext<FormValues>();
  const err = useFieldError();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> {t('admin.customers.form.personalInfo', 'Personal Information')}
        </CardTitle>
        <CardDescription>{t('admin.customers.form.personalInfoHint', 'Subscriber identity and contact details')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t('admin.customers.form.fullName', 'Full Name')} *`} error={err('name')}>
          <Input {...register('name')} autoComplete="off" />
        </Field>
        <Field label={`${t('admin.customers.form.mobile', 'Mobile Number')} *`} error={err('mobile')}>
          <Input {...register('mobile')} inputMode="tel" autoComplete="off" />
        </Field>
        <Field
          label={t('admin.customers.form.email', 'Email Address')}
          error={err('email')}
          hint={t('admin.customers.form.emailHint', 'Optional — a placeholder is generated from the PPPoE username when empty.')}
        >
          <Input type="email" {...register('email')} autoComplete="off" />
        </Field>
        <Field label={t('admin.customers.form.nid', 'NID Number')} error={err('nid_number')}>
          <Input {...register('nid_number')} inputMode="numeric" autoComplete="off" />
        </Field>
        <div className="sm:col-span-2">
          <Field label={`${t('admin.customers.form.address', 'Installation Address')} *`} error={err('address')}>
            <Input {...register('address')} autoComplete="off" />
          </Field>
        </div>
        <Field label={`${t('admin.customers.form.accountStatus', 'Account Status')} *`} error={err('status')}>
          <SelectField
            name="status"
            placeholder={t('admin.customers.form.status', 'Status')}
            options={[
              { value: 'active', label: t('admin.customers.status.active', 'Active') },
              { value: 'inactive', label: t('admin.customers.status.inactive', 'Inactive') },
            ]}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

export function ServiceSection({ showExpiry = true }: { showExpiry?: boolean }) {
  const t = useTranslations();
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
    q.isLoading
      ? t('admin.customers.form.loadingWhat', 'Loading {what}…', { what })
      : q.isError
        ? t('admin.customers.form.loadFailedWhat', 'Could not load {what}', { what })
        : t('admin.customers.form.selectWhat', 'Select {what}', { what });

  const lineTypes = LINE_TYPES.map((o) => ({
    value: o.value,
    label:
      o.value === 'fiber'
        ? t('admin.customers.form.lineFiber', 'Fiber')
        : o.value === 'radio'
          ? t('admin.customers.form.lineRadio', 'Radio')
          : o.label,
  }));
  const clientTypes = CLIENT_TYPES.map((o) => ({
    value: o.value,
    label:
      o.value === 'home'
        ? t('admin.customers.form.clientHome', 'Home')
        : o.value === 'office'
          ? t('admin.customers.form.clientOffice', 'Office')
          : t('admin.customers.form.clientCorporate', 'Corporate'),
  }));
  const billingStatuses = BILLING_STATUSES.map((o) => ({
    value: o.value,
    label:
      o.value === 'active'
        ? t('admin.customers.status.active', 'Active')
        : o.value === 'inactive'
          ? t('admin.customers.status.inactive', 'Inactive')
          : o.value === 'personal'
            ? t('admin.customers.form.billingPersonal', 'Personal')
            : t('admin.customers.form.billingFree', 'Free'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" /> {t('admin.customers.form.packageNetwork', 'Package & Network')}
        </CardTitle>
        <CardDescription>{t('admin.customers.form.packageNetworkHint', 'Plan, coverage area and MikroTik router')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t('admin.customers.form.package', 'Broadband Package')} *`} error={err('package_id')}>
          <SelectField
            name="package_id"
            placeholder={loading(packages, t('admin.customers.form.whatPackage', 'package'))}
            options={(packages.data ?? []).map((p) => ({ value: p.id, label: p.price !== null ? `${p.name} — ৳${p.price}` : p.name }))}
          />
        </Field>
        <Field label={`${t('admin.customers.form.router', 'Router')} *`} error={err('router_id')}>
          <SelectField
            name="router_id"
            placeholder={loading(routers, t('admin.customers.form.whatRouter', 'router'))}
            options={(routers.data ?? []).map((r) => ({ value: r.id, label: r.name }))}
          />
        </Field>
        <Field label={`${t('admin.customers.form.area', 'Service Area')} *`} error={err('area_id')}>
          <SelectField
            name="area_id"
            placeholder={loading(areas, t('admin.customers.form.whatArea', 'area'))}
            options={(areas.data ?? []).map((a) => ({ value: a.id, label: a.name }))}
          />
        </Field>
        <Field label={t('admin.customers.form.subArea', 'Sub-area')} error={err('sub_area_id')}>
          <SelectField
            name="sub_area_id"
            placeholder={!areaId ? t('admin.customers.form.selectAreaFirst', 'Select an area first') : loading(subAreas, t('admin.customers.form.whatSubArea', 'sub-area'))}
            disabled={!areaId || (subAreas.data?.length ?? 0) === 0}
            options={(subAreas.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
          />
        </Field>
        <Field label={t('admin.customers.form.connectionType', 'Connection Type')} error={err('connection_type')}>
          <SelectField name="connection_type" placeholder={t('admin.customers.form.selectType', 'Select type')} options={lineTypes} />
        </Field>
        <Field label={t('admin.customers.form.clientType', 'Client Type')} error={err('client_type')}>
          <SelectField name="client_type" placeholder={t('admin.customers.form.selectClientType', 'Select client type')} options={clientTypes} />
        </Field>
        <Field label={t('admin.customers.form.billingStatus', 'Billing Status')} error={err('billing_status')}>
          <SelectField name="billing_status" placeholder={t('admin.customers.form.selectBillingStatus', 'Select billing status')} options={billingStatuses} />
        </Field>
        {showExpiry && (
          <Field
            htmlFor="will_expire"
            label={t('admin.customers.form.expiry', 'Expiry Date')}
            error={err('will_expire')}
            hint={t('admin.customers.form.expiryHint', 'Leave empty to let the server compute it from the package cycle.')}
          >
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input id="will_expire" type="date" className="pl-8" {...register('will_expire')} />
            </div>
          </Field>
        )}
      </CardContent>
    </Card>
  );
}

/** PPPoE secret fields. `create` needs all four; `edit` only allows changing the profile. */
export function PppoeSection({ mode }: { mode: 'create' | 'edit' }) {
  const t = useTranslations();
  const { control, register } = useFormContext<FormValues>();
  const err = useFieldError();
  const routerId = useWatch({ control, name: 'router_id' });
  const profiles = usePppoeProfiles(routerId || undefined);

  const profilePlaceholder = !routerId
    ? t('admin.customers.form.selectRouterFirst', 'Select a router first')
    : profiles.isLoading
      ? t('admin.customers.form.loadingProfiles', 'Loading router profiles…')
      : profiles.isError || profiles.data?.reachable === false
        ? t('admin.customers.form.routerUnreachable', 'Router unreachable')
        : t('admin.customers.form.selectProfile', 'Select profile');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" /> {t('admin.customers.form.pppoeSecret', 'PPPoE Secret')}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? t('admin.customers.form.pppoeCreateHint', 'Created on the selected MikroTik router when the customer is saved.')
            : t('admin.customers.form.pppoeEditHint', 'Change the bandwidth profile on the router (leave empty to keep the current one).')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {mode === 'create' && (
          <>
            <Field label={`${t('admin.customers.form.pppoeUsername', 'PPPoE Username')} *`} error={err('pppoe_name')}>
              <Input className="font-mono" {...register('pppoe_name')} autoComplete="off" />
            </Field>
            <Field label={`${t('admin.customers.form.pppoePassword', 'PPPoE Password')} *`} error={err('pppoe_password')}>
              <Input type="password" className="font-mono" {...register('pppoe_password')} autoComplete="new-password" />
            </Field>
            <Field label={`${t('admin.customers.form.pppoeService', 'PPPoE Service')} *`} error={err('pppoe_service')}>
              <SelectField name="pppoe_service" placeholder={t('admin.customers.form.selectService', 'Select service')} options={PPPOE_SERVICES.map((s) => ({ value: s, label: s }))} />
            </Field>
          </>
        )}
        <Field
          label={mode === 'create' ? `${t('admin.customers.form.pppoeProfile', 'PPPoE Profile')} *` : t('admin.customers.form.pppoeProfile', 'PPPoE Profile')}
          error={err('pppoe_profile')}
        >
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
