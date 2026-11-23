'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';
import { knowledgeSchema, type KnowledgeFormValues } from '../schemas/knowledge.schema';
import { useSaveKnowledge } from '../hooks/useAiKnowledge';
import { KB_CATEGORIES, type KnowledgeEntry } from '../types';
import { categoryLabel, matchTypeLabel } from './labels';

const selectCls = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: KnowledgeEntry | null;
}

function toForm(e: KnowledgeEntry | null): KnowledgeFormValues {
  return {
    category: e?.category ?? 'general',
    question: e?.question ?? '',
    answer: e?.answer ?? '',
    keywords: e?.keywords ?? '',
    matchType: e?.matchType ?? 'ai_context',
    priority: e?.priority ?? 0,
    status: e?.status ?? 'active',
  };
}

export function KnowledgeFormDialog({ open, onOpenChange, entry }: Props) {
  const { t, te } = useLocale();
  const save = useSaveKnowledge();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeSchema),
    values: toForm(entry),
  });

  // Keep a stored category that is not in the preset list selectable.
  const categories =
    entry && !(KB_CATEGORIES as readonly string[]).includes(entry.category)
      ? [...KB_CATEGORIES, entry.category]
      : KB_CATEGORIES;

  const onSubmit = async (values: KnowledgeFormValues) => {
    try {
      await save.mutateAsync({ id: entry?.id, values });
      toast.success(
        entry
          ? t('platform.aiKnowledge.form.updated', 'Knowledge entry updated')
          : t('platform.aiKnowledge.form.created', 'Knowledge entry created'),
      );
      onOpenChange(false);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const fieldError = (msg?: string) =>
    msg ? <p className="text-destructive text-xs">{te(msg)}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>
            {entry
              ? t('platform.aiKnowledge.form.editTitle', 'Edit knowledge entry')
              : t('platform.aiKnowledge.form.newTitle', 'New knowledge entry')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'platform.aiKnowledge.form.desc',
              'Exact and keyword entries answer the chatbot instantly; AI-context entries are fed to the AI as official facts.',
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kb-category">
                {t('platform.aiKnowledge.form.category', 'Category *')}
              </Label>
              <select id="kb-category" className={selectCls} {...register('category')}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(t, c)}
                  </option>
                ))}
              </select>
              {fieldError(errors.category?.message)}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kb-match">
                {t('platform.aiKnowledge.form.matchType', 'Resolution mode *')}
              </Label>
              <select id="kb-match" className={selectCls} {...register('matchType')}>
                <option value="exact">{matchTypeLabel(t, 'exact')}</option>
                <option value="keywords">{matchTypeLabel(t, 'keywords')}</option>
                <option value="ai_context">{matchTypeLabel(t, 'ai_context')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kb-question">
              {t('platform.aiKnowledge.form.question', 'Question *')}
            </Label>
            <Input
              id="kb-question"
              placeholder={t(
                'platform.aiKnowledge.form.questionPh',
                'e.g. How do I pay my bill with bKash?',
              )}
              {...register('question')}
            />
            {fieldError(errors.question?.message)}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kb-answer">{t('platform.aiKnowledge.form.answer', 'Answer *')}</Label>
            <Textarea id="kb-answer" rows={6} {...register('answer')} />
            {fieldError(errors.answer?.message)}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kb-keywords">
              {t('platform.aiKnowledge.form.keywords', 'Keywords')}
            </Label>
            <Input
              id="kb-keywords"
              placeholder={t(
                'platform.aiKnowledge.form.keywordsPh',
                'Comma separated, e.g. bkash, payment, bill',
              )}
              {...register('keywords')}
            />
            {fieldError(errors.keywords?.message)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kb-priority">
                {t('platform.aiKnowledge.form.priority', 'Priority')}
              </Label>
              <Input
                id="kb-priority"
                type="number"
                min={0}
                max={100}
                {...register('priority', { valueAsNumber: true })}
              />
              {fieldError(errors.priority?.message)}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kb-status">{t('platform.aiKnowledge.form.status', 'Status')}</Label>
              <select id="kb-status" className={selectCls} {...register('status')}>
                <option value="active">{t('status.active', 'Active')}</option>
                <option value="inactive">{t('status.inactive', 'Inactive')}</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('platform.aiKnowledge.form.saving', 'Saving...')
                : entry
                  ? t('platform.aiKnowledge.form.save', 'Save changes')
                  : t('platform.aiKnowledge.form.create', 'Create entry')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
