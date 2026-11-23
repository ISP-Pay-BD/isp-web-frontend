'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/i18n/locale-context';
import { useSaveReview } from '../hooks/use-content-cms';
import { StarRating } from './StarRating';
import type { Review, ReviewInput } from '../types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toForm(r: Review | null): ReviewInput {
  return {
    name: r?.name ?? '',
    role: r?.role ?? '',
    company: r?.company ?? '',
    email: r?.email ?? '',
    phone: r?.phone ?? '',
    quote: r?.quote ?? '',
    rating: r?.rating ?? 5,
    sort_order: String(r?.sortOrder ?? 0),
    is_active: r ? r.isActive : true,
  };
}

export function ReviewDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Review | null;
}) {
  const t = useTranslations();
  const form = useForm<ReviewInput>({ defaultValues: toForm(null) });
  const save = useSaveReview(editing?.id ?? null);

  useEffect(() => {
    if (open) form.reset(toForm(editing));
  }, [open, editing, form]);

  const err = form.formState.errors;

  const submit = form.handleSubmit((v) =>
    save.mutate(v, {
      onSuccess: () => {
        toast.success(
          editing
            ? t('platform.cms.reviews.updated', 'Review updated')
            : t('platform.cms.reviews.created', 'Review added'),
        );
        onOpenChange(false);
      },
      onError: (e) => handleApiError(e, form.setError),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t('platform.cms.reviews.editTitle', 'Edit review')
              : t('platform.cms.reviews.newTitle', 'Add review')}
          </DialogTitle>
        </DialogHeader>
        <form id="review-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rv-name">{t('platform.cms.reviews.fieldName', 'Reviewer name')}</Label>
            <Input
              id="rv-name"
              aria-invalid={Boolean(err.name)}
              {...form.register('name', {
                validate: (v) =>
                  v.trim() !== '' || t('platform.cms.reviews.nameRequired', 'Name is required'),
              })}
            />
            {err.name ? <p className="text-destructive text-xs">{err.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-role">
              {t('platform.cms.reviews.fieldRole', 'Role / designation')}
            </Label>
            <Input
              id="rv-role"
              placeholder={t('platform.cms.reviews.rolePlaceholder', 'e.g. Managing Director')}
              {...form.register('role')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-company">{t('platform.cms.reviews.fieldCompany', 'Company')}</Label>
            <Input id="rv-company" {...form.register('company')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-email">
              {t('platform.cms.reviews.fieldEmail', 'Email (private)')}
            </Label>
            <Input
              id="rv-email"
              type="email"
              aria-invalid={Boolean(err.email)}
              {...form.register('email', {
                validate: (v) =>
                  v.trim() === '' ||
                  EMAIL.test(v.trim()) ||
                  t('platform.cms.reviews.emailInvalid', 'Enter a valid email address'),
              })}
            />
            {err.email ? <p className="text-destructive text-xs">{err.email.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-phone">
              {t('platform.cms.reviews.fieldPhone', 'Phone (private)')}
            </Label>
            <Input id="rv-phone" type="tel" inputMode="tel" {...form.register('phone')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rv-quote">{t('platform.cms.reviews.fieldQuote', 'Review')}</Label>
            <Textarea
              id="rv-quote"
              rows={4}
              aria-invalid={Boolean(err.quote)}
              {...form.register('quote', {
                validate: (v) =>
                  v.trim() !== '' ||
                  t('platform.cms.reviews.quoteRequired', 'Review text is required'),
              })}
            />
            {err.quote ? <p className="text-destructive text-xs">{err.quote.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium">
              {t('platform.cms.reviews.fieldRating', 'Rating')}
            </span>
            <div>
              <StarRating
                value={form.watch('rating')}
                onChange={(n) => form.setValue('rating', n)}
                label={t('platform.cms.reviews.fieldRating', 'Rating')}
                size="lg"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-sort">{t('platform.cms.fieldSortOrder', 'Sort order')}</Label>
            <Input id="rv-sort" type="number" {...form.register('sort_order')} />
          </div>
          <label className="border-border/40 flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
            <span className="text-sm">{t('platform.cms.reviews.visible', 'Show on website')}</span>
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
          </label>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" form="review-form" disabled={save.isPending}>
            {save.isPending
              ? t('platform.cms.saving', 'Saving…')
              : editing
                ? t('platform.cms.saveChanges', 'Save changes')
                : t('platform.cms.reviews.createCta', 'Add review')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
