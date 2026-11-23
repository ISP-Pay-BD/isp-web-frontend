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
import { useSaveTemplate } from '../hooks/use-content-cms';
import { CmsImage } from './CmsImage';
import { MediaUploadButton } from './MediaUploadButton';
import type { LandingTemplate, TemplateInput, TemplatePriceType } from '../types';

export const PRICE_TYPES: TemplatePriceType[] = ['Free', 'Paid', 'Premium'];

function toForm(tpl: LandingTemplate | null): TemplateInput {
  const priceType = PRICE_TYPES.find((p) => p === tpl?.priceType) ?? 'Free';
  return {
    title: tpl?.title ?? '',
    category: tpl?.category ?? '',
    technology: tpl?.technology ?? 'PHP, Laravel',
    demo_url: tpl?.demoUrl ?? '',
    image: tpl?.image ?? '',
    price_type: priceType,
    price: tpl && tpl.price > 0 ? String(tpl.price) : '',
    sort_order: String(tpl?.sortOrder ?? 0),
    description: tpl?.description ?? '',
    features: tpl?.features.join('\n') ?? '',
    is_featured: tpl ? tpl.isFeatured : true,
    status: tpl ? tpl.published : true,
  };
}

export function TemplateDialog({
  open,
  onOpenChange,
  editing,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: LandingTemplate | null;
  categories: string[];
}) {
  const t = useTranslations();
  const form = useForm<TemplateInput>({ defaultValues: toForm(null) });
  const save = useSaveTemplate(editing?.id ?? null);

  useEffect(() => {
    if (open) form.reset(toForm(editing));
  }, [open, editing, form]);

  const priceType = form.watch('price_type');
  const image = form.watch('image');
  const err = form.formState.errors;

  const submit = form.handleSubmit((v) =>
    save.mutate(
      {
        ...v,
        title: v.title.trim(),
        category: v.category.trim(),
        price: v.price_type === 'Free' ? '0' : v.price.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            editing
              ? t('platform.cms.templates.updated', 'Template updated')
              : t('platform.cms.templates.created', 'Template created'),
          );
          onOpenChange(false);
        },
        onError: (e) => handleApiError(e, form.setError),
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t('platform.cms.templates.editTitle', 'Edit template')
              : t('platform.cms.templates.newTitle', 'New template')}
          </DialogTitle>
        </DialogHeader>
        <form id="template-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-title">
              {t('platform.cms.templates.fieldTitle', 'Template name')}
            </Label>
            <Input
              id="tpl-title"
              aria-invalid={Boolean(err.title)}
              placeholder={t(
                'platform.cms.templates.titlePlaceholder',
                'e.g. TrendyNet ISP Premium',
              )}
              {...form.register('title', {
                validate: (v) => {
                  const n = v.trim().length;
                  if (n === 0)
                    return t('platform.cms.templates.titleRequired', 'Template name is required');
                  if (n < 3)
                    return t(
                      'platform.cms.templates.titleMin',
                      'Name must be at least 3 characters',
                    );
                  if (n > 255)
                    return t('platform.cms.blogs.titleMax', 'Title cannot exceed 255 characters');
                  return true;
                },
              })}
            />
            {err.title ? <p className="text-destructive text-xs">{err.title.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-category">{t('platform.cms.fieldCategory', 'Category')}</Label>
            <Input
              id="tpl-category"
              list="tpl-categories"
              aria-invalid={Boolean(err.category)}
              placeholder={t(
                'platform.cms.templates.categoryPlaceholder',
                'e.g. Broadband, ERP & Billing',
              )}
              {...form.register('category', {
                validate: (v) =>
                  v.trim() !== '' || t('platform.cms.categoryRequired', 'Category is required'),
              })}
            />
            <datalist id="tpl-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {err.category ? (
              <p className="text-destructive text-xs">{err.category.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-tech">
              {t('platform.cms.templates.fieldTechnology', 'Technology')}
            </Label>
            <Input id="tpl-tech" placeholder="PHP, Laravel" {...form.register('technology')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-demo">
              {t('platform.cms.templates.fieldDemo', 'Live demo URL')}
            </Label>
            <Input
              id="tpl-demo"
              type="url"
              placeholder="https://demo.example.com"
              {...form.register('demo_url')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-price-type">
              {t('platform.cms.templates.fieldPriceType', 'Price type')}
            </Label>
            <select
              id="tpl-price-type"
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              {...form.register('price_type')}
            >
              {PRICE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {t(`platform.cms.templates.price${p}`, p)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-price">
                {t('platform.cms.templates.fieldPrice', 'Price (৳)')}
              </Label>
              <Input
                id="tpl-price"
                type="number"
                step="0.01"
                min={0}
                disabled={priceType === 'Free'}
                aria-invalid={Boolean(err.price)}
                placeholder="0.00"
                {...form.register('price', {
                  validate: (v) =>
                    priceType === 'Free' ||
                    v.trim() === '' ||
                    Number(v) >= 0 ||
                    t('platform.cms.templates.priceInvalid', 'Enter a valid price'),
                })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-sort">{t('platform.cms.fieldSortOrder', 'Sort order')}</Label>
              <Input id="tpl-sort" type="number" {...form.register('sort_order')} />
            </div>
            {err.price ? (
              <p className="text-destructive col-span-2 text-xs">{err.price.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tpl-image">
              {t('platform.cms.templates.fieldImage', 'Preview image URL')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="tpl-image"
                type="text"
                inputMode="url"
                placeholder="https://…"
                {...form.register('image')}
              />
              <MediaUploadButton
                onUploaded={(url) => form.setValue('image', url, { shouldDirty: true })}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <CmsImage
              src={image}
              alt={t('platform.cms.templates.imagePreview', 'Template preview')}
              className="border-border/60 aspect-[16/6] w-full rounded-lg border"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tpl-desc">
              {t('platform.cms.templates.fieldDescription', 'Description')}
            </Label>
            <Textarea id="tpl-desc" rows={3} {...form.register('description')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tpl-features">
              {t('platform.cms.templates.fieldFeatures', 'Features (one per line)')}
            </Label>
            <Textarea
              id="tpl-features"
              rows={4}
              placeholder={t(
                'platform.cms.templates.featuresPlaceholder',
                'Package showcase\nCustomer self-care login\nOnline bill payment',
              )}
              {...form.register('features')}
            />
          </div>
          <label className="border-border/40 flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm">
              {t('platform.cms.templates.featured', 'Featured on landing page')}
            </span>
            <Switch
              checked={form.watch('is_featured')}
              onCheckedChange={(v) => form.setValue('is_featured', v)}
            />
          </label>
          <label className="border-border/40 flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm">
              {t('platform.cms.templates.visible', 'Visible on website')}
            </span>
            <Switch
              checked={form.watch('status')}
              onCheckedChange={(v) => form.setValue('status', v)}
            />
          </label>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" form="template-form" disabled={save.isPending}>
            {save.isPending
              ? t('platform.cms.saving', 'Saving…')
              : editing
                ? t('platform.cms.saveChanges', 'Save changes')
                : t('platform.cms.templates.createCta', 'Create template')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
