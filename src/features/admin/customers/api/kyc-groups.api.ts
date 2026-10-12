import { http, saveBlob } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import type { CustomerGroup, CustomerGroupMember, KycDocument } from '../types';

type Raw = Record<string, unknown>;

const mapDoc = (r: Raw): KycDocument => ({
  id: str(r.id),
  docType: str(r.doc_type),
  docNumber: str(r.doc_number) || null,
  originalName: str(r.original_name),
  mimeType: str(r.mime_type),
  fileSize: num(r.file_size),
  status: (['pending', 'verified', 'rejected'].includes(str(r.status)) ? str(r.status) : 'pending') as KycDocument['status'],
  note: str(r.note) || null,
  uploadedByName: str(r.uploaded_by_name) || null,
  verifiedByName: str(r.verified_by_name) || null,
  verifiedAt: str(r.verified_at) || null,
  createdAt: str(r.created_at) || null,
});

const mapGroup = (r: Raw): CustomerGroup => ({
  id: str(r.id),
  name: str(r.name),
  parentName: str(r.parent_name) || null,
  billingMode: str(r.billing_mode) === 'consolidated' ? 'consolidated' : 'individual',
  note: str(r.note) || null,
  memberCount: num(r.member_count),
  createdAt: str(r.created_at) || null,
});

const mapMember = (r: Raw): CustomerGroupMember => ({
  id: str(r.id),
  name: str(r.name),
  mobile: str(r.mobile),
  status: str(r.status),
  willExpire: str(r.will_expire) || null,
  addedAt: str(r.added_at) || null,
});

const customers = () => `/v1/reseller/customers/${getResellerId()}`;
const groups = () => `/v1/reseller/customer-groups/${getResellerId()}`;

export const kycApi = {
  list: async (customerId: string, page: number, perPage: number, status?: string) => {
    const res = await http.getPage<Raw>(
      `${customers()}/${customerId}/kyc`,
      { page, per_page: perPage, status: status && status !== 'all' ? status : undefined },
      { listKey: 'items' },
    );
    const customer = (res.raw.customer ?? {}) as Raw;
    const counts = (res.raw.counts ?? {}) as Raw;
    return {
      items: res.items.map(mapDoc),
      meta: res.meta,
      customer: { id: str(customer.id), name: str(customer.name), nidVerified: Boolean(customer.nid_verified) },
      counts: { pending: num(counts.pending), verified: num(counts.verified), rejected: num(counts.rejected) },
      docTypes: Array.isArray(res.raw.doc_types) ? (res.raw.doc_types as unknown[]).map((t) => str(t)) : [],
    };
  },
  upload: (customerId: string, v: { docType: string; docNumber: string; file: File }) => {
    const fd = new FormData();
    fd.append('doc_type', v.docType);
    if (v.docNumber) fd.append('doc_number', v.docNumber);
    fd.append('file', v.file);
    return http.upload<Raw>(`${customers()}/${customerId}/kyc`, fd);
  },
  review: (docId: string, status: 'verified' | 'rejected', note?: string) =>
    http.post<Raw>(`${customers()}/kyc/${docId}/review`, { status, note: note || undefined }),
  remove: (docId: string) => http.delete(`${customers()}/kyc/${docId}`),
  download: async (doc: KycDocument) => {
    const { blob, filename } = await http.download(`${customers()}/kyc/${doc.id}/file`);
    saveBlob(blob, filename ?? (doc.originalName || `kyc-${doc.id}`));
  },
};

export const groupsApi = {
  list: async (params: { page: number; perPage: number; search?: string; billingMode?: string }) => {
    const res = await http.getPage<Raw>(groups(), {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      billing_mode: params.billingMode && params.billingMode !== 'all' ? params.billingMode : undefined,
    });
    return { items: res.items.map(mapGroup), meta: res.meta };
  },
  summary: async () => {
    const r = await http.get<Raw>(`${groups()}/summary`);
    return {
      totalGroups: num(r.total_groups),
      totalMembers: num(r.total_members),
      consolidated: num(r.consolidated),
      individual: num(r.individual),
    };
  },
  create: (body: Record<string, unknown>) => http.post<Raw>(groups(), body),
  update: (id: string, body: Record<string, unknown>) => http.put<Raw>(`${groups()}/${id}`, body),
  remove: (id: string) => http.delete(`${groups()}/${id}`),
  members: async (groupId: string, page: number, perPage: number, search?: string) => {
    const res = await http.getPage<Raw>(`${groups()}/${groupId}/members`, { page, per_page: perPage, search: search || undefined });
    return { items: res.items.map(mapMember), meta: res.meta };
  },
  addMembers: (groupId: string, ids: string[]) => http.post<Raw>(`${groups()}/${groupId}/members`, { ids }),
  removeMembers: (groupId: string, ids: string[]) => http.delete<Raw>(`${groups()}/${groupId}/members`, undefined, { ids }),
};
