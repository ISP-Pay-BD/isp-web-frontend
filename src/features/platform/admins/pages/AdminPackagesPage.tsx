'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Link from 'next/link';
import { Package, Check, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBdt } from '@/lib/format';
import type { AdminPackageInput, AdminPackageTier } from '@/features/platform/types';

const selectClass = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm';

const EMPTY: AdminPackageInput = {
  name: '',
  price: 0,
  pricing_type: 'monthly',
  plan_type: 'fixed',
  max_customers: 0,
  preview_days: 0,
  base_fee: 0,
  per_user_rate: 0,
  min_topup: 0,
  trial_days: 0,
  is_public: true,
  is_active: true,
  sort_order: 0,
  features_text: '',
  assigned_user_id: null,
};

function toInput(p: AdminPackageTier): AdminPackageInput {
  return {
    name: p.name,
    price: p.priceBdt,
    pricing_type: p.pricingType,
    plan_type: p.planType,
    max_customers: p.maxCustomers,
    preview_days: p.previewDays,
    base_fee: p.baseFee,
    per_user_rate: p.perUserRate,
    min_topup: p.minTopup,
    trial_days: p.trialDays,
    is_public: p.isPublic,
    is_active: p.isActive,
    sort_order: p.sortOrder,
    features_text: p.featuresText,
    assigned_user_id: p.assignedUserId,
  };
}

function PackageDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminPackageTier | null;
}) {
  const qc = useQueryClient();
  const form = useForm<AdminPackageInput>({ defaultValues: EMPTY });
  const planType = form.watch('plan_type');

  useEffect(() => {
    if (open) form.reset(editing ? toInput(editing) : EMPTY);
  }, [open, editing, form]);

  const tenantsQuery = useQuery({
    queryKey: ['platform', 'admins', 'list', { role: 'admin', perPage: 100 }],
    queryFn: () => platformService.getAdmins({ role: 'admin', perPage: 100 }),
    enabled: open && planType === 'custom',
  });

  const save = useMutation({
    mutationFn: (v: AdminPackageInput) => {
      const payload: AdminPackageInput = {
        ...v,
        price: Number(v.price),
        max_customers: Number(v.max_customers),
        preview_days: Number(v.preview_days),
        base_fee: Number(v.base_fee),
        per_user_rate: Number(v.per_user_rate),
        min_topup: Number(v.min_topup),
        trial_days: Number(v.trial_days),
        sort_order: Number(v.sort_order),
        assigned_user_id: v.plan_type === 'custom' && v.assigned_user_id ? Number(v.assigned_user_id) : null,
      };
      return editing ? platformService.updateAdminPackage(editing.id, payload) : platformService.createAdminPackage(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Package updated' : 'Package created');
      void qc.invalidateQueries({ queryKey: ['platform', 'admins', 'packages'] });
      void qc.invalidateQueries({ queryKey: ['platform', 'tenant-options'] });
      onOpenChange(false);
    },
    onError: (err) => handleApiError(err, form.setError as never),
  });

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : 'New admin package'}</DialogTitle>
        </DialogHeader>
        <form id="package-form" onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pkg-name">Name</Label>
            <Input id="pkg-name" {...form.register('name', { required: 'Name is required' })} />
            {err.name ? <p className="text-xs text-destructive">{err.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-plan-type">Plan type</Label>
            <select id="pkg-plan-type" className={selectClass} {...form.register('plan_type')}>
              <option value="fixed">Fixed (prepaid period)</option>
              <option value="payg">Pay-As-You-Go (wallet)</option>
              <option value="custom">Custom (one tenant)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-pricing">Billing interval</Label>
            <select id="pkg-pricing" className={selectClass} {...form.register('pricing_type')}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {planType === 'payg' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-base">Base fee (৳ / cycle)</Label>
                <Input id="pkg-base" type="number" step="0.01" min={0} {...form.register('base_fee')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-rate">Per-subscriber rate (৳)</Label>
                <Input id="pkg-rate" type="number" step="0.01" min={0} {...form.register('per_user_rate')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-topup">Minimum wallet top-up (৳)</Label>
                <Input id="pkg-topup" type="number" step="0.01" min={0} {...form.register('min_topup')} />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price">Price (৳)</Label>
              <Input id="pkg-price" type="number" step="0.01" min={0} {...form.register('price')} />
              {err.price ? <p className="text-xs text-destructive">{err.price.message}</p> : null}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-days">Free preview days (used when trial is 0)</Label>
            <Input id="pkg-days" type="number" min={0} {...form.register('preview_days')} />
            {err.preview_days ? <p className="text-xs text-destructive">{err.preview_days.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-cap">Subscriber cap (0 = no cap)</Label>
            <Input id="pkg-cap" type="number" min={0} {...form.register('max_customers')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-trial">Trial days</Label>
            <Input id="pkg-trial" type="number" min={0} {...form.register('trial_days')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pkg-sort">Sort order</Label>
            <Input id="pkg-sort" type="number" min={0} {...form.register('sort_order')} />
          </div>
          {planType === 'custom' ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pkg-assigned">Assigned tenant admin</Label>
              <select id="pkg-assigned" className={selectClass} {...form.register('assigned_user_id')}>
                <option value="">Select a tenant admin</option>
                {(tenantsQuery.data?.items ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.organizationName ?? a.name} — {a.email}
                  </option>
                ))}
              </select>
              {err.assigned_user_id ? <p className="text-xs text-destructive">{err.assigned_user_id.message}</p> : null}
            </div>
          ) : null}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pkg-features">Features (one per line; “+ ” included, “- ” excluded)</Label>
            <Textarea id="pkg-features" rows={4} {...form.register('features_text')} className="font-mono text-xs" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <span className="text-sm">Active</span>
            <Switch checked={form.watch('is_active')} onCheckedChange={(v) => form.setValue('is_active', v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <span className="text-sm">Shown on public pricing</span>
            <Switch
              checked={form.watch('is_public')}
              disabled={planType === 'custom'}
              onCheckedChange={(v) => form.setValue('is_public', v)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="package-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create package'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PricingSettings({ months, percent }: { months: number; percent: number }) {
  const qc = useQueryClient();
  const [m, setM] = useState(String(months));
  const [p, setP] = useState(String(percent));
  useEffect(() => {
    setM(String(months));
    setP(String(percent));
  }, [months, percent]);

  const save = useMutation({
    mutationFn: () =>
      platformService.savePricingSettings({ yearly_discount_months: Number(m), yearly_discount_percent: Number(p) }),
    onSuccess: () => {
      toast.success('Yearly discount saved');
      void qc.invalidateQueries({ queryKey: ['platform', 'admins', 'packages'] });
      void qc.invalidateQueries({ queryKey: ['platform', 'settings'] });
    },
  });

  return (
    <Card className="border-border/60 bg-primary/5">
      <CardContent className="flex flex-wrap items-end gap-4 p-4 text-sm">
        <div className="min-w-[220px] flex-1">
          <span className="font-semibold">Yearly discount:</span> pay for {Math.max(0, 12 - Number(m || 0))} months, get{' '}
          {Number(m || 0)} months free ({Number(p || 0)}% savings shown on pricing)
        </div>
        <div className="space-y-1">
          <Label htmlFor="ym" className="text-xs">Free months (0–11)</Label>
          <Input id="ym" type="number" min={0} max={11} value={m} onChange={(e) => setM(e.target.value)} className="h-8 w-24" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yp" className="text-xs">Badge % (0–99)</Label>
          <Input id="yp" type="number" min={0} max={99} value={p} onChange={(e) => setP(e.target.value)} className="h-8 w-24" />
        </div>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save discount'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminPackagesPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPackageTier | null>(null);
  const [deleting, setDeleting] = useState<AdminPackageTier | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'admins', 'packages'],
    queryFn: () => platformService.getAdminPackages(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => platformService.deleteAdminPackage(id),
    onSuccess: () => {
      toast.success('Package deleted');
      void qc.invalidateQueries({ queryKey: ['platform', 'admins', 'packages'] });
    },
    onSettled: () => setDeleting(null),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load packages"
        description={error instanceof Error ? error.message : 'Could not retrieve admin package tiers.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Admin Packages"
        subtitle="Subscription tiers for ISP tenants — pricing, billing period and subscriber caps"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Admins', href: '/platform/admins' },
          { label: 'Packages' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/platform/admins">
              <Button variant="outline" size="sm">
                Back to Admins
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> New package
            </Button>
          </div>
        }
      />

      <PricingSettings months={data.yearlyDiscountMonths} percent={data.yearlyDiscountPercent} />

      {data.items.length === 0 ? (
        <EmptyState title="No admin packages yet" description="Create the first tier tenants can subscribe to." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.items.map((pkg) => (
            <Card key={pkg.id} className="border-border/60 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {pkg.name}
                  </CardTitle>
                  <Badge variant={pkg.isActive ? 'default' : 'secondary'} className="text-xs">
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {pkg.planType === 'payg' ? (
                  <div className="text-lg font-bold text-primary">
                    ৳{formatBdt(pkg.baseFee)}
                    <span className="text-sm font-normal text-muted-foreground"> + ৳{formatBdt(pkg.perUserRate)}/subscriber</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    ৳{formatBdt(pkg.priceBdt)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{pkg.pricingType}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <Badge variant="outline" className="uppercase">{pkg.planType}</Badge>
                  <Badge variant="outline" className="capitalize">{pkg.pricingType}</Badge>
                  {!pkg.isPublic ? <Badge variant="outline">Hidden</Badge> : null}
                  {pkg.trialDays > 0 ? <Badge variant="outline">{pkg.trialDays}-day trial</Badge> : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pkg.maxCustomers > 0 ? `Up to ${pkg.maxCustomers.toLocaleString()} subscribers` : 'No subscriber cap'}
                </div>
                <div className="text-xs font-medium">{pkg.tenantCount} tenant(s) on this package</div>
                {pkg.features.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {pkg.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-1.5">
                        {f.included ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? '' : 'text-muted-foreground line-through'}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
              <div className="flex justify-end gap-1.5 border-t border-border/40 px-4 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    setEditing(pkg);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  disabled={pkg.tenantCount > 0}
                  title={pkg.tenantCount > 0 ? 'Move tenants off this package before deleting it' : undefined}
                  onClick={() => setDeleting(pkg)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PackageDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.name}?` : 'Delete package'}
        description="This tier is removed permanently. Tenants cannot pick it any more."
        confirmLabel={remove.isPending ? 'Deleting…' : 'Delete package'}
        destructive
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
