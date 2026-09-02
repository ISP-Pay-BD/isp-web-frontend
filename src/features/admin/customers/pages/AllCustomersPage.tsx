'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Phone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { Customer } from '../types';

export function AllCustomersPage() {
  const { data, isLoading, isError, refetch } = useCustomers();
  const deleteMutation = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [connFilter, setConnFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rawList = data?.items ?? [];

  const filteredData = useMemo(() => {
    return rawList.filter((c) => {
      const matchesSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.ipAddress && c.ipAddress.includes(search));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && c.online) ||
        (statusFilter === 'offline' && !c.online) ||
        c.status === statusFilter;

      const matchesConn =
        connFilter === 'all' || c.connectionType === connFilter;

      return matchesSearch && matchesStatus && matchesConn;
    });
  }, [rawList, search, statusFilter, connFilter]);

  const columns: LegacyColumnDef<Customer, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {c.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/admin/customers/${c.id}`}
                className="font-medium hover:underline text-foreground"
              >
                {c.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">{c.username}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Phone className="h-3 w-3" /> {c.phone}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'packageName',
      header: 'Package & Area',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <div className="font-medium text-sm">{c.packageName}</div>
            <div className="text-xs text-muted-foreground">{c.areaName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'connectionType',
      header: 'Connection',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              {c.online ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-3.5 w-3.5" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <WifiOff className="h-3.5 w-3.5" /> Offline
                </span>
              )}
              <span className="text-xs uppercase text-muted-foreground font-mono">
                ({c.connectionType})
              </span>
            </div>
            {c.ipAddress && (
              <div className="font-mono text-[11px] text-muted-foreground">
                {c.ipAddress}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Account Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const d = row.original.expiryDate;
        const isExpired = row.original.status === 'expired';
        return (
          <span
            className={`font-mono text-xs ${
              isExpired
                ? 'font-semibold text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {d}
          </span>
        );
      },
    },
    {
      accessorKey: 'balanceBdt',
      header: 'Balance',
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={row.original.balanceBdt}
          className={
            row.original.balanceBdt > 0
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : ''
          }
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem render={<Link href={`/admin/customers/${c.id}`} />}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <Can menu="customer" action="update">
                <DropdownMenuItem render={<Link href={`/admin/customers/${c.id}/edit`} />}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Customer
                </DropdownMenuItem>
              </Can>
              <DropdownMenuSeparator />
              <Can menu="customer" action="delete">
                <DropdownMenuItem
                  onClick={() => setDeleteId(c.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load customers"
        description="Could not fetch customer directory."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Manage broadband subscribers, connection credentials, and billing cycles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Can menu="customer" action="create">
            <Link href="/admin/customers/import">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Import Excel
              </Button>
            </Link>
            <Link href="/admin/customers/new">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-1.5 h-4 w-4" /> Add Customer
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Toolbar & Filters (mirroring list-toolbar.php) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, phone, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          <Select value={connFilter} onValueChange={(v) => v && setConnFilter(v)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pppoe">PPPoE</SelectItem>
              <SelectItem value="static">Static IP</SelectItem>
              <SelectItem value="hotspot">Hotspot</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setConnFilter('all');
              refetch();
            }}
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        emptyTitle="No customers found"
        emptyDescription="No subscribers match your search criteria. Try clearing filters or create a new customer."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? All active sessions and billing history will be moved to the recycle bin."
        confirmLabel="Delete Customer"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
