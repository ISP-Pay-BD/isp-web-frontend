'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/** Sales leads CRM — GET/POST/PUT/DELETE /v1/network-ops/leads (ai_leads, tenant-scoped). */

export const LEAD_STAGES = ['new', 'contacted', 'survey', 'negotiation', 'won', 'lost'] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export interface Lead {
  id: string;
  leadNo: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  area: string | null;
  address: string | null;
  packageId: string | null;
  packageName: string | null;
  /** The chosen package's real monthly price; null when no package picked. */
  monthlyValue: number | null;
  otcQuote: number | null;
  stage: LeadStage;
  ownerId: string | null;
  ownerName: string | null;
  source: string | null;
  surveyFeasible: boolean | null;
  notes: string | null;
  message: string | null;
  createdAt: string | null;
  lastContactedAt: string | null;
}

export interface LeadSummary {
  total: number;
  byStage: Record<LeadStage, number>;
  pipelineMonthlyValue: number;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;
const optNum = (v: unknown) => (v === null || v === undefined || v === '' ? null : num(v));

export function mapLead(raw: unknown): Lead {
  const r = obj(raw);
  const stage = str(r.stage) as LeadStage;
  return {
    id: str(r.id),
    leadNo: str(r.lead_no),
    name: str(r.name),
    company: opt(r.company),
    phone: opt(r.phone),
    email: opt(r.email),
    area: opt(r.area),
    address: opt(r.address),
    packageId: opt(r.package_id),
    packageName: opt(r.package_name),
    monthlyValue: optNum(r.monthly_value),
    otcQuote: optNum(r.otc_quote),
    stage: LEAD_STAGES.includes(stage) ? stage : 'new',
    ownerId: opt(r.owner_id),
    ownerName: opt(r.owner_name),
    source: opt(r.source),
    surveyFeasible: r.survey_feasible === null || r.survey_feasible === undefined ? null : Boolean(r.survey_feasible),
    notes: opt(r.notes),
    message: opt(r.message),
    createdAt: opt(r.created_at),
    lastContactedAt: opt(r.last_contacted_at),
  };
}

const leadKeys = {
  all: ['admin', 'leads'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'leads', 'list', params] as const,
};

export function useLeads({ page, pageSize, search, stage }: { page: number; pageSize: number; search?: string; stage?: LeadStage | '' }) {
  const params = { page, limit: pageSize, search: search || undefined, stage: stage || undefined };
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/leads', params, { signal });
      const s = obj(res.raw.summary);
      const byStage = obj(s.by_stage);
      const summary: LeadSummary = {
        total: num(s.total),
        byStage: Object.fromEntries(LEAD_STAGES.map((k) => [k, num(byStage[k])])) as Record<LeadStage, number>,
        pipelineMonthlyValue: num(s.pipeline_monthly_value),
      };
      return { items: res.items.map(mapLead), meta: res.meta, summary };
    },
    placeholderData: keepPreviousData,
  });
}

/** Body keys are the backend's snake_case fields. */
export type LeadPayload = Record<string, unknown>;

export function useSaveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: LeadPayload }) =>
      mapLead(id ? await http.put<unknown>(`/v1/network-ops/leads/${id}`, body) : await http.post<unknown>('/v1/network-ops/leads', body)),
    onSuccess: (_lead, { id }) => {
      toast.success(id ? 'Lead updated' : 'Lead added');
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useMoveLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, surveyFeasible }: { id: string; stage: LeadStage; surveyFeasible?: boolean }) =>
      mapLead(await http.post<unknown>(`/v1/network-ops/leads/${id}/stage`, { stage, survey_feasible: surveyFeasible })),
    onSuccess: (lead) => {
      toast.success(`Lead moved to ${lead.stage}`);
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/network-ops/leads/${id}`),
    onSuccess: () => {
      toast.success('Lead deleted');
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
