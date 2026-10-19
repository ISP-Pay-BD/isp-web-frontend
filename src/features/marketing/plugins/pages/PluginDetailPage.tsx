'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Puzzle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { Reveal } from '@/components/motion/Reveal';
import { useLocale, useTranslations } from '@/i18n/locale-context';
import { pluginPriceLabel, usePublicPlugin, useRequestPlugin } from '../hooks/use-marketing-plugins';
import type { PluginRequestInput } from '../types';

const requestSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter a valid BD mobile number (e.g. 017XXXXXXXX)'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).optional(),
  company: z.string().trim().max(150).optional(),
  message: z.string().trim().max(1000).optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none';

export function PluginDetailPage() {
  const t = useTranslations();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { data: plugin, isLoading, isError, error, refetch } = usePublicPlugin(slug);
  const [showForm, setShowForm] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  return (
    <div className="min-h-dvh bg-landing-bg text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/plugins" className="text-sm text-white/50 underline hover:text-white">
          {t('marketing.pluginDetail.allPlugins', '← All plugins')}
        </Link>

        {isLoading ? (
          <p className="mt-8 text-sm text-white/50">{t('marketing.pluginDetail.loading', 'Loading plugin…')}</p>
        ) : isError || !plugin ? (
          error?.status === 404 ? (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
              <h1 className="text-xl font-semibold">
                {t('marketing.pluginDetail.notFoundTitle', 'Plugin not found')}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                {t('marketing.pluginDetail.notFoundDesc', "This add-on doesn't exist or isn't available right now.")}
              </p>
              <Link href="/plugins" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 border-white/20 text-white')}>
                {t('marketing.pluginDetail.browse', 'Browse plugins')}
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/70">{error?.message || t('marketing.pluginDetail.loadFailed', 'Failed to load this plugin.')}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          )
        ) : (
          <Reveal>
            <div className="mt-8 flex items-start gap-4">
              {plugin.imageUrl ? (
                // Remote catalog image (arbitrary host) — next/image would need a remotePatterns entry.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={plugin.imageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-landing-cta/20">
                  <Puzzle className="h-7 w-7 text-landing-accent" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-white/60">{plugin.category}</p>
                <h1 className="text-3xl font-semibold tracking-tight">{plugin.name}</h1>
                {plugin.description ? (
                  <p className="mt-2 max-w-xl whitespace-pre-line text-white/60">{plugin.description}</p>
                ) : null}
                <p className="mt-4 text-lg font-medium text-landing-accent">{pluginPriceLabel(t, plugin)}</p>
                {plugin.priceType ? (
                  <p className="text-xs capitalize text-white/60">{plugin.priceType}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="bg-landing-cta text-white duration-200 ease-out hover:bg-landing-cta-hover"
                    onClick={() => {
                      setShowForm(true);
                      setSentMessage(null);
                    }}
                  >
                    {t('marketing.pluginDetail.requestEnable', 'Request enable')}
                  </Button>
                  <Link href="/register" className={cn(buttonVariants({ variant: 'outline' }), 'border-white/20 text-white')}>
                    {t('marketing.pluginDetail.createAccount', 'Create an account')}
                  </Link>
                </div>
              </div>
            </div>

            {sentMessage ? (
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p>{sentMessage}</p>
              </div>
            ) : showForm ? (
              <RequestEnableForm
                slug={slug}
                pluginName={plugin.name}
                onCancel={() => setShowForm(false)}
                onSent={(message) => {
                  setShowForm(false);
                  setSentMessage(message);
                }}
              />
            ) : null}
          </Reveal>
        )}
      </div>
    </div>
  );
}

function RequestEnableForm({
  slug,
  pluginName,
  onCancel,
  onSent,
}: {
  slug: string;
  pluginName: string;
  onCancel: () => void;
  onSent: (message: string) => void;
}) {
  const { t, te } = useLocale();
  const request = useRequestPlugin(slug);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });

  const fieldError = (message?: string) => (message ? te(message) : undefined);

  const onSubmit = (values: RequestForm) => {
    const input: PluginRequestInput = {
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      company: values.company || undefined,
      message: values.message || undefined,
    };
    request.mutate(input, {
      onSuccess: (res) => {
        const message =
          res.message ||
          t('marketing.pluginDetail.requestReceived', 'Your request for {name} was received.', { name: pluginName });
        toast.success(message);
        onSent(message);
      },
      onError: (err) => {
        handleApiError(
          err,
          setError,
          t('marketing.pluginDetail.sendFailed', 'Something went wrong. Please try again.'),
        );
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
      noValidate
    >
      <h2 className="text-base font-semibold">
        {t('marketing.pluginDetail.formTitle', 'Request {name}', { name: pluginName })}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('marketing.pluginDetail.fieldName', 'Your name *')} error={fieldError(errors.name?.message)}>
          <input {...register('name')} autoComplete="name" className={inputClass} />
        </Field>
        <Field label={t('marketing.pluginDetail.fieldPhone', 'Mobile number *')} error={fieldError(errors.phone?.message)}>
          <input {...register('phone')} inputMode="tel" autoComplete="tel" placeholder="017XXXXXXXX" className={`${inputClass} font-mono`} />
        </Field>
        <Field label={t('marketing.pluginDetail.fieldEmail', 'Email (optional)')} error={fieldError(errors.email?.message)}>
          <input {...register('email')} type="email" autoComplete="email" className={inputClass} />
        </Field>
        <Field label={t('marketing.pluginDetail.fieldCompany', 'Company (optional)')} error={fieldError(errors.company?.message)}>
          <input {...register('company')} autoComplete="organization" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('marketing.pluginDetail.fieldMessage', 'Message (optional)')} error={fieldError(errors.message?.message)}>
            <textarea {...register('message')} rows={3} className={inputClass} />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={request.isPending}
          className="bg-landing-cta text-white duration-200 ease-out hover:bg-landing-cta-hover"
        >
          {request.isPending
            ? t('marketing.pluginDetail.sending', 'Sending…')
            : t('marketing.pluginDetail.send', 'Send request')}
        </Button>
        <Button type="button" variant="outline" className="border-white/20 bg-transparent text-white" onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/80">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
