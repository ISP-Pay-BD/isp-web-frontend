'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotUserItem } from '@/data/admin/network-ops.data';
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
import { formatMac } from '@/lib/format/network';
import {
  Plus,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ArrowDownUp,
  MoreHorizontal,
  UserX,
  RotateCcw,
  Trash2,
  Laptop,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

const userSearchFilter = (
  row: LegacyRow<HotspotUserItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const u = row.original;
  return (
    u.username.toLowerCase().includes(q) ||
    u.macAddress.toLowerCase().includes(q) ||
    u.ipAddress.includes(q) ||
    u.pin.includes(q) ||
    u.profileName.toLowerCase().includes(q)
  );
};

export function HotspotUsersPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();
  const [users, setUsers] = useState<HotspotUserItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [profileName, setProfileName] = useState('24 Hours (10 Mbps)');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  const initial = data?.users ?? [];
  const list = users.length > 0 ? users : initial;

  const totalUsers = list.length;
  const activeCount = list.filter((u) => u.status === 'active').length;
  const expiredCount = totalUsers - activeCount;
  const totalTrafficMb = list.reduce((s, u) => s + (u.bytesInMb || 0) + (u.bytesOutMb || 0), 0);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter username');
      return;
    }

    const newUser: HotspotUserItem = {
      id: `hu_${Date.now()}`,
      username,
      profileId: 'hs_1',
      server: 'hotspot1',
      pin: pin.trim() || Math.floor(100000 + Math.random() * 900000).toString(),
      profileName,
      macAddress: macAddress.trim() || 'D4:6E:0E:12:34:56',
      ipAddress: ipAddress.trim() || '10.5.50.45',
      uptime: '0m',
      bytesInMb: 0,
      bytesOutMb: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...(prev.length > 0 ? prev : initial)]);
    toast.success(`Hotspot user "${newUser.username}" created with PIN ${newUser.pin}.`);
    setModalOpen(false);
    setUsername('');
    setPin('');
    setMacAddress('');
    setIpAddress('');
  };

  const handleExportCsv = () => {
    const headers = ['Username', 'PIN', 'Profile', 'MAC Address', 'IP Address', 'Uptime', 'Bytes In (MB)', 'Bytes Out (MB)', 'Status'];
    const rows = list.map((u) => [
      u.username,
      u.pin,
      `"${u.profileName}"`,
      u.macAddress,
      u.ipAddress,
      u.uptime,
      u.bytesInMb,
      u.bytesOutMb,
      u.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotspot_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Hotspot user registry exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<HotspotUserItem, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'User Account & Credentials',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Laptop className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{row.original.username}</span>
              <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                <Key className="h-3 w-3 text-primary" />
                <span>PIN: {row.original.pin}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'profileName',
        header: 'Profile Tier',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-medium">
            {row.original.profileName}
          </Badge>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: 'Bound MAC',
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
            {formatMac(row.original.macAddress)}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.ipAddress}</span>
        ),
      },
      {
        id: 'traffic',
        header: 'Traffic (In / Out)',
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <span className="text-emerald-500 font-medium">↓ {row.original.bytesInMb} MB</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-sky-500 font-medium">↑ {row.original.bytesOutMb} MB</span>
          </div>
        ),
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
              className={active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
            >
              {active ? 'Online' : 'Expired'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Extended 24hr for ${u.username}`)}>
                  <Clock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Extend Validity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Reset MAC binding for ${u.username}`)}>
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Reset MAC Binding
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Session ${u.username} disconnected`)}
                >
                  <UserX className="h-3.5 w-3.5 mr-2" />
                  Disconnect Session
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`User ${u.username} deleted`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return <EmptyState title="Failed to load hotspot users" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Users & Client Accounts"
        subtitle="Manage active guest client logins, MAC address authorizations, bandwidth usage, and session quotas."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Users' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add Hotspot User
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Registered</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalUsers}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Users & voucher accounts</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Online</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {activeCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Currently connected</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Expired</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {expiredCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Session quota reached</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Traffic</span>
            <ArrowDownUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {(totalTrafficMb / 1024).toFixed(2)} GB
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cumulative data throughput</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="username"
        searchFilterFn={userSearchFilter}
        searchPlaceholder="Search user by username, PIN, MAC, or IP..."
      />

      {/* Add User Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddUser}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Register Direct Hotspot User
              </DialogTitle>
              <DialogDescription>
                Create a permanent or long-term guest user with assigned bandwidth profile and credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="usr-name">Username *</Label>
                  <Input
                    id="usr-name"
                    placeholder="e.g. guest_vip01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="usr-pin">PIN / Password (Optional)</Label>
                  <Input
                    id="usr-pin"
                    placeholder="Auto-generated if empty"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usr-profile">Bandwidth Profile *</Label>
                <Select value={profileName} onValueChange={(val) => { if (val) setProfileName(val); }}>
                  <SelectTrigger id="usr-profile">
                    <SelectValue placeholder="Select Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24 Hours (10 Mbps)">24 Hours (10 Mbps)</SelectItem>
                    <SelectItem value="2 Hours (5 Mbps)">2 Hours (5 Mbps)</SelectItem>
                    <SelectItem value="7 Days Unlimited (15 Mbps)">7 Days Unlimited (15 Mbps)</SelectItem>
                    <SelectItem value="1 Month VIP Access (20 Mbps)">1 Month VIP Access (20 Mbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="usr-mac">Bound MAC Address</Label>
                  <Input
                    id="usr-mac"
                    placeholder="e.g. AA:BB:CC:DD:EE:FF"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="usr-ip">Static IP (Optional)</Label>
                  <Input
                    id="usr-ip"
                    placeholder="e.g. 10.5.50.45"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
