'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { usePurchase, type PurchaseVendor } from '../hooks/use-purchase';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Plus,
  Download,
  Building2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  CreditCard,
  Receipt,
  FileText,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const vendorSearchFilter = (
  row: LegacyRow<PurchaseVendor>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const v = row.original;
  return (
    v.name.toLowerCase().includes(q) ||
    v.contactPerson.toLowerCase().includes(q) ||
    v.phone.includes(q) ||
    (v.email ?? '').toLowerCase().includes(q) ||
    (v.address ?? '').toLowerCase().includes(q)
  );
};

export function VendorsPage() {
  const { vendors: initialVendors, isLoading, isError, refetch } = usePurchase();
  const [vendors, setVendors] = useState<PurchaseVendor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balanceBdt, setBalanceBdt] = useState('0');
  const [status, setStatus] = useState('active');

  const list = vendors.length > 0 ? vendors : initialVendors;

  const totalVendors = list.length;
  const activeCount = list.filter((v) => v.status === 'active').length;
  const totalPayableBalance = list.reduce((acc, v) => acc + (v.balanceBdt || 0), 0);
  const avgBalance = totalVendors > 0 ? Math.round(totalPayableBalance / totalVendors) : 0;

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter supplier / vendor name');
      return;
    }

    const newVendor: PurchaseVendor = {
      id: `v_${Date.now()}`,
      name,
      contactPerson: contactPerson || 'Procurement Rep',
      phone: phone || '+880 1700-000000',
      email: email || `sales@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      address: address || 'Motijheel C/A, Dhaka, Bangladesh',
      status,
      balanceBdt: Number(balanceBdt) || 0,
    };

    setVendors((prev) => [newVendor, ...(prev.length > 0 ? prev : initialVendors)]);
    toast.success(`Supplier "${newVendor.name}" onboarded successfully.`);
    setModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setBalanceBdt('0');
  };

  const handleExportCsv = () => {
    const headers = ['Vendor Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Payable Balance (BDT)', 'Status'];
    const rows = list.map((v) => [
      `"${v.name.replace(/"/g, '""')}"`,
      `"${v.contactPerson}"`,
      v.phone,
      v.email ?? '',
      `"${(v.address ?? '').replace(/"/g, '""')}"`,
      v.balanceBdt,
      v.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_vendors_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Vendors & suppliers directory exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<PurchaseVendor, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Vendor & Company Name',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{v.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{v.address || 'Dhaka, Bangladesh'}</span>
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">{row.original.contactPerson}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone & Communication',
        size: 200,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                <Phone className="h-3 w-3 text-primary shrink-0" />
                <span>{v.phone}</span>
              </div>
              {v.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[140px]">{v.email}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'balanceBdt',
        header: 'Payable Balance',
        size: 150,
        cell: ({ row }) => {
          const bal = row.original.balanceBdt || 0;
          return (
            <span
              className={`font-semibold text-sm tabular-nums ${
                bal > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatBdtWithSymbol(bal)}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const active = row.original.status === 'active';
          return (
            <Badge
              variant="outline"
              className={
                active
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {active ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Vendor Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Opening ledger for ${v.name}`)}>
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  View Supplier Ledger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Creating bill for ${v.name}`)}>
                  <Receipt className="h-3.5 w-3.5 mr-2" />
                  Record Purchase Bill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Payment voucher opened for ${v.name}`)}>
                  <CreditCard className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Disburse Payment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Vendor ${v.name} deactivated`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Deactivate Vendor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load vendors" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Equipment Vendors"
        subtitle="Manage hardware distributors, optical cable suppliers, upstream bandwidth providers, and accounts payable."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Purchase', href: '/admin/purchase/bills' },
          { label: 'Vendors' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Directory
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Onboard Vendor
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Suppliers</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalVendors}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Registered commercial partners</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Suppliers</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {activeCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Regular procurement channels</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Payable Balance</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {formatBdtWithSymbol(totalPayableBalance)}
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">Total supplier dues</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Due / Vendor</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(avgBalance)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Per vendor exposure</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={vendorSearchFilter}
        searchPlaceholder="Search vendor by company name, contact, phone, or address..."
      />

      {/* Onboard Vendor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddVendor}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Onboard New Supplier / Vendor
              </DialogTitle>
              <DialogDescription>
                Add a hardware distributor, optical fiber importer, or upstream network supplier.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="v-name">Company / Vendor Name *</Label>
                <Input
                  id="v-name"
                  placeholder="e.g. Huawei Bangladesh Direct / BDCOM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-contact">Contact Person</Label>
                  <Input
                    id="v-contact"
                    placeholder="e.g. Asif Chowdhury"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-phone">Phone / Mobile</Label>
                  <Input
                    id="v-phone"
                    placeholder="e.g. +880 1711-889900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-email">Corporate Email</Label>
                  <Input
                    id="v-email"
                    type="email"
                    placeholder="e.g. sales@vendorbd.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-balance">Opening Balance Due (BDT)</Label>
                  <Input
                    id="v-balance"
                    type="number"
                    value={balanceBdt}
                    onChange={(e) => setBalanceBdt(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-address">Physical Office Address</Label>
                <Input
                  id="v-address"
                  placeholder="e.g. Level 7, Navana Tower, Gulshan-1, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Onboard Supplier</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
