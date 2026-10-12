'use client';

import { useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { BadgeCheck, Download, Trash2, Upload } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api/client';
import { errorMessage, handleApiError } from '@/lib/api/utils/error-handler';
import { useCustomerKyc, useKycMutations } from '@/features/admin/customers/hooks/use-customer-kyc';
import { OptionSelect } from '@/features/admin/customers/components/OptionSelect';
import type { KycDocument } from '@/features/admin/customers/types';

const DOC_LABEL: Record<string, string> = {
  nid: 'National ID',
  passport: 'Passport',
  birth_certificate: 'Birth certificate',
  driving_license: 'Driving license',
  trade_license: 'Trade license',
  photo: 'Photo',
  other: 'Other',
};

const STATUS_FILTERS = ['all', 'pending', 'verified', 'rejected'] as const;

export function CustomerKycPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id ?? '';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerKyc(customerId, page, pageSize, status);
  const m = useKycMutations(customerId);

  // Upload form
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('nid');
  const [docNumber, setDocNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Review dialogs
  const [rejectDoc, setRejectDoc] = useState<KycDocument | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [deleteDoc, setDeleteDoc] = useState<KycDocument | null>(null);

  const upload = async () => {
    if (!file) return;
    setUploadErrors({});
    try {
      await m.upload.mutateAsync({ docType, docNumber: docNumber.trim(), file });
      setFile(null);
      setDocNumber('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setUploadErrors(
          Object.fromEntries(Object.entries(err.details).map(([k, v]) => [k, Array.isArray(v) ? String(v[0] ?? '') : String(v)])),
        );
      }
      handleApiError(err);
    }
  };

  const columns = useMemo<LegacyColumnDef<KycDocument, unknown>[]>(
    () => [
      {
        accessorKey: 'docType',
        header: 'Type',
        enableHiding: false,
        cell: ({ row }) => <Badge variant="outline">{DOC_LABEL[row.original.docType] ?? row.original.docType}</Badge>,
      },
      {
        accessorKey: 'docNumber',
        header: 'Number',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.docNumber ?? '—'}</span>,
      },
      {
        accessorKey: 'originalName',
        header: 'File',
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.originalName || '—'}
            <span className="text-muted-foreground"> · {(row.original.fileSize / 1024).toFixed(0)} KB</span>
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Uploaded',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.createdAt?.slice(0, 16) ?? '—'}
            {row.original.uploadedByName ? <span className="text-muted-foreground"> · {row.original.uploadedByName}</span> : null}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <StatusBadge status={row.original.status === 'verified' ? 'approved' : row.original.status} label={row.original.status} />
            {row.original.note && <div className="text-[11px] text-muted-foreground max-w-[220px] truncate">{row.original.note}</div>}
            {row.original.verifiedByName && (
              <div className="text-[11px] text-muted-foreground">by {row.original.verifiedByName}</div>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button size="sm" variant="ghost" title="Download" onClick={() => m.download.mutate(doc)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Can menu="customer" action="update">
                {doc.status !== 'verified' && (
                  <Button size="sm" variant="outline" disabled={m.review.isPending} onClick={() => m.review.mutate({ docId: doc.id, status: 'verified' })}>
                    Verify
                  </Button>
                )}
                {doc.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30"
                    onClick={() => {
                      setRejectNote('');
                      setRejectDoc(doc);
                    }}
                  >
                    Reject
                  </Button>
                )}
              </Can>
              <Can menu="customer" action="delete">
                <Button size="sm" variant="ghost" className="text-destructive" title="Delete" onClick={() => setDeleteDoc(doc)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Can>
            </div>
          );
        },
      },
    ],
    [m.download, m.review],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load KYC" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const customerName = data.customer.name || `#${customerId}`;
  const docTypes = (data.docTypes.length ? data.docTypes : Object.keys(DOC_LABEL)).map((t) => ({ value: t, label: DOC_LABEL[t] ?? t }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="KYC vault"
        subtitle={`Identity documents for ${customerName}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: customerName, url: `/admin/customers/${customerId}` },
          { label: 'KYC' },
        ]}
      />
      <OpsSummaryStrip
        items={[
          { value: data.counts.pending + data.counts.verified + data.counts.rejected, label: 'docs' },
          { value: data.counts.pending, label: 'pending' },
          { value: data.counts.verified, label: 'verified' },
          { value: data.counts.rejected, label: 'rejected' },
          {
            value: data.customer.nidVerified ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" /> verified
              </span>
            ) : (
              'not verified'
            ),
            label: 'NID',
          },
        ]}
      />

      <Can menu="customer" action="update">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Upload document</CardTitle>
            <CardDescription className="text-xs">JPG, PNG, WEBP or PDF up to 5 MB. Verifying an NID marks the customer&apos;s NID as verified.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4 sm:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Document type</Label>
              <OptionSelect value={docType} onChange={setDocType} options={docTypes} className="w-full" invalid={Boolean(uploadErrors.doc_type)} />
              {uploadErrors.doc_type && <p className="text-xs text-destructive">{uploadErrors.doc_type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Document number</Label>
              <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="font-mono" />
              {uploadErrors.doc_number && <p className="text-xs text-destructive">{uploadErrors.doc_number}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">File</Label>
              <Input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {uploadErrors.file && <p className="text-xs text-destructive">{uploadErrors.file}</p>}
            </div>
            <Button onClick={upload} disabled={!file || m.upload.isPending} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> {m.upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </CardContent>
        </Card>
      </Can>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            className="h-7 text-xs capitalize"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        isLoading={isFetching && !data}
        emptyTitle="No documents"
        emptyDescription="Upload the customer's NID or other identity documents above."
        server={{
          page,
          pageSize,
          total: data.meta.total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />

      {/* Reject with a reason */}
      <Dialog open={rejectDoc !== null} onOpenChange={(open) => !open && setRejectDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
            <DialogDescription>Tell the team why {rejectDoc ? DOC_LABEL[rejectDoc.docType] ?? rejectDoc.docType : 'the document'} was rejected.</DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            maxLength={255}
            className="w-full rounded-md border border-border/80 bg-background p-2.5 text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectNote.trim() || m.review.isPending}
              onClick={() =>
                rejectDoc &&
                m.review.mutate(
                  { docId: rejectDoc.id, status: 'rejected', note: rejectNote.trim() },
                  { onSuccess: () => setRejectDoc(null) },
                )
              }
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDoc !== null}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        title="Delete document?"
        description="The file is removed permanently."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteDoc) {
            await m.remove.mutateAsync(deleteDoc.id);
            setDeleteDoc(null);
          }
        }}
      />
    </div>
  );
}
