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
import { useSaveBlog } from '../hooks/use-content-cms';
import { CmsImage } from './CmsImage';
import { MediaUploadButton } from './MediaUploadButton';
import type { BlogInput, BlogPost } from '../types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toForm(post: BlogPost | null): BlogInput {
  return {
    title: post?.title ?? '',
    category: post?.category ?? '',
    author: post?.author ?? '',
    published_at: post?.publishedAt ? post.publishedAt.slice(0, 10) : today(),
    thumbnail: post?.thumbnail ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    is_featured: post ? post.isFeatured : true,
    status: post ? post.published : true,
  };
}

export function BlogDialog({
  open,
  onOpenChange,
  editing,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: BlogPost | null;
  categories: string[];
}) {
  const t = useTranslations();
  const form = useForm<BlogInput>({ defaultValues: toForm(null) });
  const save = useSaveBlog(editing?.id ?? null);

  useEffect(() => {
    if (open) form.reset(toForm(editing));
  }, [open, editing, form]);

  const submit = form.handleSubmit((v) =>
    save.mutate(
      {
        ...v,
        title: v.title.trim(),
        category: v.category.trim(),
        author: v.author.trim(),
        thumbnail: v.thumbnail.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            editing
              ? t('platform.cms.blogs.updated', 'Blog post updated')
              : t('platform.cms.blogs.created', 'Blog post created'),
          );
          onOpenChange(false);
        },
        onError: (e) => handleApiError(e, form.setError),
      },
    ),
  );

  const err = form.formState.errors;
  const thumb = form.watch('thumbnail');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t('platform.cms.blogs.editTitle', 'Edit blog post')
              : t('platform.cms.blogs.newTitle', 'New blog post')}
          </DialogTitle>
        </DialogHeader>
        <form id="blog-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="blog-title">{t('platform.cms.blogs.fieldTitle', 'Title')}</Label>
            <Input
              id="blog-title"
              aria-invalid={Boolean(err.title)}
              placeholder={t(
                'platform.cms.blogs.titlePlaceholder',
                'e.g. 5 ways billing automation saves ISP overhead',
              )}
              {...form.register('title', {
                validate: (v) => {
                  const n = v.trim().length;
                  if (n === 0) return t('platform.cms.blogs.titleRequired', 'Title is required');
                  if (n < 5)
                    return t('platform.cms.blogs.titleMin', 'Title must be at least 5 characters');
                  if (n > 255)
                    return t('platform.cms.blogs.titleMax', 'Title cannot exceed 255 characters');
                  return true;
                },
              })}
            />
            {err.title ? <p className="text-destructive text-xs">{err.title.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-category">{t('platform.cms.fieldCategory', 'Category')}</Label>
            <Input
              id="blog-category"
              list="blog-categories"
              aria-invalid={Boolean(err.category)}
              placeholder={t(
                'platform.cms.blogs.categoryPlaceholder',
                'e.g. ISP Billing, Automation',
              )}
              {...form.register('category', {
                validate: (v) =>
                  v.trim() !== '' || t('platform.cms.categoryRequired', 'Category is required'),
              })}
            />
            <datalist id="blog-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {err.category ? (
              <p className="text-destructive text-xs">{err.category.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-author">{t('platform.cms.blogs.fieldAuthor', 'Author')}</Label>
            <Input
              id="blog-author"
              placeholder={t('platform.cms.blogs.authorPlaceholder', 'ISP Pay BD Team')}
              {...form.register('author')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-date">
              {t('platform.cms.blogs.fieldPublishedAt', 'Publish date')}
            </Label>
            <Input id="blog-date" type="date" {...form.register('published_at')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-thumb">
              {t('platform.cms.blogs.fieldCover', 'Cover image URL')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="blog-thumb"
                type="text"
                inputMode="url"
                placeholder="https://…"
                {...form.register('thumbnail')}
              />
              <MediaUploadButton
                onUploaded={(url) => form.setValue('thumbnail', url, { shouldDirty: true })}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <CmsImage
              src={thumb}
              alt={t('platform.cms.blogs.coverPreview', 'Cover preview')}
              className="border-border/60 aspect-[16/6] w-full rounded-lg border"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="blog-excerpt">{t('platform.cms.blogs.fieldExcerpt', 'Excerpt')}</Label>
            <Textarea
              id="blog-excerpt"
              rows={2}
              placeholder={t(
                'platform.cms.blogs.excerptPlaceholder',
                'Short overview shown on cards. Left empty, it is taken from the content.',
              )}
              {...form.register('excerpt')}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="blog-content">
              {t('platform.cms.blogs.fieldContent', 'Content (HTML allowed)')}
            </Label>
            <Textarea
              id="blog-content"
              rows={10}
              aria-invalid={Boolean(err.content)}
              className="font-mono text-xs"
              {...form.register('content', {
                validate: (v) =>
                  v.trim() !== '' || t('platform.cms.blogs.contentRequired', 'Content is required'),
              })}
            />
            {err.content ? <p className="text-destructive text-xs">{err.content.message}</p> : null}
          </div>
          <label className="border-border/40 flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm">
              {t('platform.cms.blogs.featured', 'Featured on homepage')}
            </span>
            <Switch
              checked={form.watch('is_featured')}
              onCheckedChange={(v) => form.setValue('is_featured', v)}
            />
          </label>
          <label className="border-border/40 flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm">{t('platform.cms.blogs.publish', 'Published')}</span>
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
          <Button type="submit" form="blog-form" disabled={save.isPending}>
            {save.isPending
              ? t('platform.cms.saving', 'Saving…')
              : editing
                ? t('platform.cms.saveChanges', 'Save changes')
                : t('platform.cms.blogs.createCta', 'Create post')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
