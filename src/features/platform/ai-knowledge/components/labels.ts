import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

export function categoryLabel(t: Translate, c: string): string {
  if (c === 'billing') return t('platform.aiKnowledge.cat.billing', 'Billing & payments');
  if (c === 'technical')
    return t('platform.aiKnowledge.cat.technical', 'Technical / router / PPPoE');
  if (c === 'packages') return t('platform.aiKnowledge.cat.packages', 'Packages & offers');
  if (c === 'contact') return t('platform.aiKnowledge.cat.contact', 'Contact & hotline');
  if (c === 'general') return t('platform.aiKnowledge.cat.general', 'General');
  return c;
}

export function matchTypeLabel(t: Translate, m: string): string {
  if (m === 'exact') return t('platform.aiKnowledge.match.exact', 'Exact answer (instant)');
  if (m === 'keywords')
    return t('platform.aiKnowledge.match.keywords', 'Keyword trigger (instant)');
  if (m === 'ai_context')
    return t('platform.aiKnowledge.match.aiContext', 'AI context (sent to the AI)');
  return m;
}
