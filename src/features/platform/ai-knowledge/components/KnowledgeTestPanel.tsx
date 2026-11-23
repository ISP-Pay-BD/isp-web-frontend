'use client';

import { useState } from 'react';
import { FlaskConical, Layers, SearchX, Timer, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n/locale-context';
import { useTestKnowledgeQuery } from '../hooks/useAiKnowledge';
import { categoryLabel, matchTypeLabel } from './labels';

/** Sandbox: which knowledge entry would answer a customer's question instantly. */
export function KnowledgeTestPanel() {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const test = useTestKnowledgeQuery();
  const result = test.data;

  return (
    <Card className="border-border/60 bg-card/60 rounded-xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FlaskConical className="text-primary h-4 w-4" />
          {t('platform.aiKnowledge.test.title', 'Test a question')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) test.mutate(query.trim());
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'platform.aiKnowledge.test.placeholder',
              'Type what a customer would ask...',
            )}
            aria-label={t('platform.aiKnowledge.test.title', 'Test a question')}
          />
          <Button type="submit" disabled={!query.trim() || test.isPending} className="shrink-0">
            {test.isPending
              ? t('platform.aiKnowledge.test.running', 'Testing...')
              : t('platform.aiKnowledge.test.run', 'Run test')}
          </Button>
        </form>

        {result && (result.latencyMs !== null || result.explanation) ? (
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
            {result.latencyMs !== null ? (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Timer className="h-3 w-3" aria-hidden />
                {t('platform.aiKnowledge.test.latency', '{ms} ms', {
                  ms: result.latencyMs.toFixed(result.latencyMs < 10 ? 1 : 0),
                })}
              </span>
            ) : null}
            {result.explanation ? <span>{result.explanation}</span> : null}
          </p>
        ) : null}

        {result ? (
          result.matched && result.entry ? (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" tone="success">
                  <Zap className="mr-1 h-3 w-3" />
                  {t('platform.aiKnowledge.test.direct', 'Instant direct match')}
                </Badge>
                <Badge variant="outline">{matchTypeLabel(t, result.matchType)}</Badge>
                <Badge variant="outline">{categoryLabel(t, result.entry.category)}</Badge>
              </div>
              <p className="font-semibold">{result.entry.question}</p>
              <p className="text-muted-foreground break-words whitespace-pre-line">
                {result.entry.answer}
              </p>
            </div>
          ) : result.related.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm">
              <Badge variant="outline" tone="info">
                <Layers className="mr-1 h-3 w-3" />
                {t('platform.aiKnowledge.test.rag', 'AI answers with these entries as context')}
              </Badge>
              <ul className="divide-border/60 divide-y">
                {result.related.map((e) => (
                  <li key={e.id} className="space-y-0.5 py-2">
                    <p className="font-semibold">{e.question}</p>
                    <p className="text-muted-foreground line-clamp-2 text-xs break-words">
                      {categoryLabel(t, e.category)} · {e.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
              <SearchX className="mt-0.5 h-4 w-4 shrink-0" />
              {t(
                'platform.aiKnowledge.test.noMatch',
                'No exact or keyword entry matched. The chatbot will answer with the AI engine and its system instructions.',
              )}
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
