'use client';

import { useMemo, useState } from 'react';
import { Search, Filter, CheckSquare, Square, X, Trash2, RotateCcw, Layers, UserPlus, Edit, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { toast } from 'sonner';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTranslations } from '@/i18n/locale-context';
import { PERMISSION_CATEGORIES } from './PermissionMatrix';
import { actionLabel, categoryLabel, roleLabel, sectionLabel, sectionMatches } from '../labels';
import {
  fetchTenantRoleDefaults,
  useAccessCandidates,
  useAccessCatalog,
  useCreateCustomAccess,
  useCustomAccessList,
  useDeleteCustomAccess,
  useUpdateCustomAccess,
} from '../hooks/use-user-access';
import type { AccessRole, CustomAccessRecord, PermissionMap } from '../types';

import { formatCount, formatDateTime } from '@/lib/format';

const ROLE_COLORS: Record<string, string> = {
  resellerAdmin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  employee: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  admin: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  user: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const ROLE_FILTERS = ['all', 'resellerAdmin', 'employee'] as const;

const CATALOG_ROLES: AccessRole[] = ['admin', 'resellerAdmin', 'employee', 'user'];
const asCatalogRole = (role: string): AccessRole => (CATALOG_ROLES.includes(role as AccessRole) ? (role as AccessRole) : 'employee');
const fmt = (iso: string) => (iso ? formatDateTime(iso.replace(' ', 'T')) : '—');

interface Editing {
  /** existing record id, or null when creating */
  id: string | null;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: PermissionMap;
}

export function CustomAccessTable() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const debouncedSearch = useDebouncedValue(search.trim());
  const list = useCustomAccessList({ page, pageSize, search: debouncedSearch, role: roleFilter });

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Editing | null>(null);
  const candidates = useAccessCandidates(addOpen);
  const create = useCreateCustomAccess();
  const update = useUpdateCustomAccess();
  const remove = useDeleteCustomAccess();

  const openRecord = (r: CustomAccessRecord) =>
    setEditing({ id: r.id, userId: r.userId, name: r.name, email: r.email, role: r.role, status: r.status, permissions: structuredClone(r.permissions) });

  const startCreate = async (candidate: { id: string; name: string; email: string; role: string }) => {
    setAddOpen(false);
    let defaults: PermissionMap = {};
    try {
      defaults = await fetchTenantRoleDefaults(asCatalogRole(candidate.role));
    } catch {
      // start from an empty matrix when the defaults cannot be read
    }
    setEditing({ id: null, userId: candidate.id, name: candidate.name, email: candidate.email, role: candidate.role, status: 'active', permissions: defaults });
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      update.mutate(
        { id: editing.id, status: editing.status, permissions: editing.permissions },
        {
          onSuccess: () => {
            toast.success(t('admin.userAccess.custom.toastUpdated', 'Permissions updated for {name}', { name: editing.name }));
            setEditing(null);
          },
        },
      );
    } else {
      create.mutate(
        { userId: editing.userId, status: editing.status, permissions: editing.permissions },
        {
          onSuccess: () => {
            toast.success(t('admin.userAccess.custom.toastAdded', 'Custom access added for {name}', { name: editing.name }));
            setEditing(null);
          },
        },
      );
    }
  };

  const records = list.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('admin.userAccess.custom.searchPlaceholder', 'Search by name, email or mobile...')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-8.5 bg-muted/20 border-border/60 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={t('common.table.clearSearch', 'Clear search')}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> {t('admin.userAccess.custom.roleFilter', 'Role:')}
            </span>
            {ROLE_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setRoleFilter(key);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  roleFilter === key
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {roleLabel(t, key)}
              </button>
            ))}
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm" className="h-8 gap-1.5 text-xs font-semibold shrink-0">
            <UserPlus className="h-3.5 w-3.5" />
            {t('admin.userAccess.custom.add', 'Add Custom Access')}
          </Button>
        </div>
      </div>

      {list.isLoading ? (
        <PageSkeleton variant="table" rows={4} />
      ) : list.isError ? (
        <EmptyState variant="error" title={t('admin.userAccess.custom.loadFailed', 'Could not load custom access')} description={errorMessage(list.error)} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <p className="text-foreground text-sm font-semibold">{t('admin.userAccess.custom.emptyTitle', 'No custom access users found')}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {search
              ? t('admin.userAccess.custom.noMatches', 'No matches for "{q}"', { q: search })
              : t('admin.userAccess.custom.emptyDesc', 'No users have custom overrides configured.')}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">{t('platform.userAccess.page.colUser', 'User')}</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">{t('platform.userAccess.page.colRole', 'Role')}</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">{t('admin.userAccess.custom.colOverrides', 'Overrides')}</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">{t('platform.userAccess.page.colStatus', 'Status')}</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">{t('admin.userAccess.custom.colUpdated', 'Account updated')}</TableHead>
                <TableHead className="py-3 text-right font-semibold text-xs text-muted-foreground">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const rules = Object.values(record.permissions).reduce((acc, a) => acc + a.length, 0);
                return (
                  <TableRow key={record.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                          {(record.name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{record.name || t('admin.userAccess.custom.userFallback', 'User #{id}', { id: record.userId })}</div>
                          <div className="text-xs text-muted-foreground font-mono">{record.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={`text-xs font-medium ${ROLE_COLORS[record.role] ?? 'bg-muted/50 text-muted-foreground'}`}>
                        {roleLabel(t, record.role, record.roleLabel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {t('admin.userAccess.custom.rules', '{n} rules', { n: formatCount(rules) })}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${record.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${record.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        {record.status === 'active' ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-muted-foreground">{fmt(record.updatedAt)}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => openRecord(record)} className="h-7.5 gap-1.5 text-xs hover:border-primary hover:text-primary">
                        <Edit className="h-3 w-3" />
                        {t('admin.userAccess.custom.editPermissions', 'Edit Permissions')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {(list.data?.meta.total ?? 0) > pageSize && (
            <div className="p-3 border-t border-border/50">
              <TablePagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={list.data?.meta.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                pageSizeOptions={[10, 25, 50]}
              />
            </div>
          )}
        </div>
      )}

      <PermissionDialog
        editing={editing}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={() => setConfirmDelete(editing)}
        saving={create.isPending || update.isPending}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md bg-card border-border p-5 shadow-xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              {t('admin.userAccess.custom.addTitle', 'Add Custom User Access')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('admin.userAccess.custom.addDesc', "Pick a staff member or POP account. It starts from its role's defaults.")}
            </DialogDescription>
          </DialogHeader>
          {candidates.isLoading ? (
            <PageSkeleton variant="table" rows={3} />
          ) : candidates.isError ? (
            <EmptyState variant="error" title={t('admin.userAccess.custom.candidatesFailed', 'Could not load accounts')} description={errorMessage(candidates.error)} actionLabel={t('common.retry', 'Retry')} onAction={() => candidates.refetch()} />
          ) : (candidates.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">{t('admin.userAccess.custom.candidatesEmpty', 'Every active staff and POP account already has custom access.')}</p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {(candidates.data ?? []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => void startCreate(c)}
                  className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-muted/30 rounded"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{c.mobile || c.email}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${ROLE_COLORS[c.role] ?? ''}`}>
                    {roleLabel(t, c.role)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={t('admin.userAccess.custom.removeTitle', 'Remove custom access?')}
        description={
          confirmDelete
            ? t('admin.userAccess.custom.removeDesc', '{name} goes back to the default permissions of their role.', { name: confirmDelete.name })
            : undefined
        }
        confirmLabel={t('admin.userAccess.custom.removeConfirm', 'Remove')}
        destructive
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (!target?.id) return;
          remove.mutate(target.id, {
            onSuccess: () => {
              toast.success(t('admin.userAccess.custom.toastRemoved', 'Custom override removed for {name}', { name: target.name }));
              setEditing(null);
            },
          });
        }}
      />
    </div>
  );
}

function PermissionDialog({
  editing,
  onChange,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  editing: Editing | null;
  onChange: (next: Editing) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const t = useTranslations();
  const role = asCatalogRole(editing?.role ?? 'employee');
  const catalog = useAccessCatalog(role);
  const sections = useMemo(() => catalog.data?.sections ?? [], [catalog.data]);
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogCategory, setDialogCategory] = useState('all');
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const filtered = useMemo(
    () =>
      sections.filter((s) => {
        if (dialogCategory !== 'all') {
          const cat = PERMISSION_CATEGORIES.find((c) => c.id === dialogCategory);
          if (cat && !cat.keys.includes(s.key)) return false;
        }
        return sectionMatches(t, s, dialogSearch);
      }),
    [sections, dialogCategory, dialogSearch, t],
  );

  if (!editing) return null;
  const perms = editing.permissions;
  const setPerms = (next: PermissionMap) => onChange({ ...editing, permissions: next });
  const total = Object.values(perms).reduce((acc, a) => acc + a.length, 0);

  const toggle = (sectionKey: string, action: string, on: boolean) => {
    const current = perms[sectionKey] ?? [];
    const updated = on ? [...new Set([...current, action])] : current.filter((a) => a !== action);
    const next = { ...perms };
    if (updated.length) next[sectionKey] = updated;
    else delete next[sectionKey];
    setPerms(next);
  };

  const resetToRole = async () => {
    setLoadingDefaults(true);
    try {
      setPerms(await fetchTenantRoleDefaults(role));
      toast.info(t('admin.userAccess.custom.roleDefaultsLoaded', 'Role defaults loaded — save to apply'));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoadingDefaults(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] sm:max-w-4xl md:max-w-5xl bg-card border-border p-5 sm:p-6 shadow-xl max-h-[92vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>{editing.name}</span>
                <Badge variant="outline" className={`text-xs ${ROLE_COLORS[editing.role] ?? ''}`}>
                  {roleLabel(t, editing.role)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {editing.email || t('admin.userAccess.custom.userFallback', 'User #{id}', { id: editing.userId })}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={editing.status === 'active'} onCheckedChange={(v) => onChange({ ...editing, status: v ? 'active' : 'inactive' })} />
                {editing.status === 'active' ? t('admin.userAccess.custom.overrideActive', 'Override active') : t('admin.userAccess.custom.overridePaused', 'Override paused')}
              </label>
              <Badge variant="secondary" className="text-xs font-mono font-semibold">
                {t('admin.userAccess.custom.enabledBadge', '{n} enabled', { n: formatCount(total) })}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2.5 space-y-2 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder={t('admin.userAccess.custom.searchPerms', 'Search permissions...')} value={dialogSearch} onChange={(e) => setDialogSearch(e.target.value)} className="pl-8 h-8 text-xs bg-muted/20 border-border/60" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={() => void resetToRole()} disabled={loadingDefaults} className="h-7.5 px-2 text-xs">
                <RotateCcw className="h-3 w-3 mr-1" /> {loadingDefaults ? t('common.loading', 'Loading…') : t('admin.userAccess.custom.roleDefaults', 'Role defaults')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPerms(Object.fromEntries(sections.map((s) => [s.key, Object.keys(s.actions)])))}
                className="h-7.5 px-2 text-xs text-primary"
              >
                <CheckSquare className="h-3 w-3 mr-1" /> {t('admin.userAccess.matrix.selectAll', 'Select All')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPerms(
                    Object.fromEntries(
                      sections.filter((s) => 'read' in s.actions).map((s) => [s.key, ['read']]),
                    ),
                  )
                }
                className="h-7.5 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" /> {t('admin.userAccess.matrix.viewOnly', 'View Only')}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPerms({})} className="h-7.5 px-2 text-xs text-muted-foreground hover:text-destructive">
                <Square className="h-3 w-3 mr-1" /> {t('admin.userAccess.matrix.clear', 'Clear')}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0 font-medium">
              <Layers className="h-3.5 w-3.5" /> {t('admin.userAccess.custom.category', 'Category:')}
            </span>
            {PERMISSION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setDialogCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors border ${
                  dialogCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {categoryLabel(t, cat.id)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 min-h-[300px]">
          {catalog.isLoading ? (
            <PageSkeleton variant="table" rows={4} />
          ) : catalog.isError ? (
            <EmptyState variant="error" title={t('admin.userAccess.custom.catalogFailed', 'Could not load the permission catalogue')} description={errorMessage(catalog.error)} actionLabel={t('common.retry', 'Retry')} onAction={() => catalog.refetch()} />
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">{t('admin.userAccess.custom.noModules', 'No matching permission modules.')}</div>
          ) : (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-[220px]">{t('admin.userAccess.custom.dlgColModule', 'Module')}</th>
                    <th className="py-2.5 px-3">{t('admin.userAccess.custom.dlgColActions', 'Allowed Actions')}</th>
                    <th className="py-2.5 px-3 text-right w-[100px]">{t('admin.userAccess.custom.dlgColToggle', 'Toggle')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((section) => {
                    const active = perms[section.key] ?? [];
                    const allKeys = Object.keys(section.actions);
                    const isAll = allKeys.length > 0 && allKeys.every((k) => active.includes(k));
                    return (
                      <tr key={section.key} className={`hover:bg-muted/20 transition-colors ${active.length > 0 ? 'bg-primary/[0.02]' : ''}`}>
                        <td className="py-2.5 px-3 align-top">
                          <div className="font-semibold text-foreground text-xs">{sectionLabel(t, section)}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {t('admin.userAccess.matrix.enabledOf', '{n} of {total} enabled', {
                              n: formatCount(active.filter((a) => allKeys.includes(a)).length),
                              total: formatCount(allKeys.length),
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 align-middle">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {Object.entries(section.actions).map(([actKey, label]) => {
                              const id = `custom-${section.key}-${actKey}`;
                              const checked = active.includes(actKey);
                              return (
                                <label
                                  key={actKey}
                                  htmlFor={id}
                                  className={`inline-flex items-center gap-1.5 cursor-pointer select-none py-0.5 px-1.5 rounded transition-colors ${
                                    checked ? 'bg-primary/10 text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                  }`}
                                >
                                  <Checkbox id={id} checked={checked} onCheckedChange={(v) => toggle(section.key, actKey, v === true)} className="h-3.5 w-3.5" />
                                  <span className="text-xs">{actionLabel(t, actKey, label)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 align-middle text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const next = { ...perms };
                              if (isAll) delete next[section.key];
                              else next[section.key] = allKeys;
                              setPerms(next);
                            }}
                            className="h-6 px-2 text-xs text-primary hover:bg-primary/10 font-medium"
                          >
                            {isAll ? t('admin.userAccess.matrix.deselect', 'Deselect') : t('admin.userAccess.matrix.selectAll', 'Select All')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {editing.id ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2 self-start sm:self-auto">
              <Trash2 className="h-3.5 w-3.5" />
              {t('admin.userAccess.custom.deleteOverride', 'Delete Custom Override')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-8 px-3">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="button" size="sm" onClick={onSave} disabled={saving} className="text-xs font-semibold h-8 px-4 shadow-sm">
              {saving
                ? t('admin.userAccess.matrix.saving', 'Saving...')
                : editing.id
                  ? t('admin.userAccess.custom.saveChanges', 'Save Changes')
                  : t('admin.userAccess.custom.createOverride', 'Create Override')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
