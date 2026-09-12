'use client';

import { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  FileText, 
  Clock, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { CustomUserAccessRecord, PermissionSectionDef } from '@/data/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CustomAccessTableProps {
  records: CustomUserAccessRecord[];
  sections?: PermissionSectionDef[];
  onView?: (record: CustomUserAccessRecord) => void;
  onUpdateRecord?: (record: CustomUserAccessRecord) => void;
}

const ROLE_COLORS: Record<string, string> = {
  resellerAdmin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  employee: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  admin: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  user: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const ROLE_LABELS: Record<string, string> = {
  all: 'All Roles',
  admin: 'Admin',
  resellerAdmin: 'Reseller / POP',
  employee: 'Employee',
  user: 'Customer',
};

export function CustomAccessTable({ records, sections, onView, onUpdateRecord }: CustomAccessTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<CustomUserAccessRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter records based on search query and role filter
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || r.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [records, searchQuery, roleFilter]);

  const handleOpenDetails = (record: CustomUserAccessRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
    onView?.(record);
  };

  return (
    <div className="space-y-4">
      {/* Search & Custom Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search custom user by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/20 border-border/60 text-sm focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {Object.entries(ROLE_LABELS).map(([key, label]) => {
            const active = roleFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRoleFilter(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Surface */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-dashed border-border/70 bg-card/40">
          <div className="p-3.5 rounded-2xl bg-muted/40 mb-3 border border-border/50">
            <Search className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-foreground text-sm font-semibold">No matching custom access users</p>
          <p className="text-muted-foreground text-xs mt-1 max-w-sm">
            {searchQuery
              ? `No users match "${searchQuery}". Try adjusting your keywords or clearing the search.`
              : 'No custom overrides configured for this role filter.'}
          </p>
          {(searchQuery || roleFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
              }}
              className="mt-4 text-xs h-8"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-xs backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">User Profile</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Role</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Overrides</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Last Audit</TableHead>
                <TableHead className="py-3 text-right font-semibold text-xs text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="group border-b border-border/40 hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-xs">
                        {record.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {record.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Mail className="h-3 w-3 opacity-60" />
                          {record.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold gap-1 ${ROLE_COLORS[record.role] ?? 'bg-muted/50 text-muted-foreground border-border/50'}`}
                    >
                      <Shield className="h-2.5 w-2.5" />
                      {ROLE_LABELS[record.role] || record.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/15">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono text-xs font-bold text-primary">{record.customRulesCount}</span>
                      <span className="text-[10px] text-muted-foreground">overrides</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 opacity-60" />
                      <span className="font-mono text-[11px]">{record.updatedAt}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(record)}
                      className="h-8 gap-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail & Custom Rule Inspector Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/80 p-6 shadow-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                    {selectedRecord.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      {selectedRecord.name}
                      <Badge variant="outline" className={`text-[10px] font-semibold ${ROLE_COLORS[selectedRecord.role]}`}>
                        {ROLE_LABELS[selectedRecord.role]}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono mt-0.5 text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedRecord.email} · ID: {selectedRecord.userId}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs">
                    <span className="font-semibold text-foreground">Custom Permission Overrides</span>
                    <span className="font-mono text-primary font-bold">{selectedRecord.customRulesCount} active rules</span>
                  </div>
                  
                  {/* Permissions Breakdown List */}
                  <div className="mt-3 grid gap-2 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(selectedRecord.permissions).map(([moduleKey, actions]) => (
                      <div
                        key={moduleKey}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold uppercase tracking-wider text-[11px] text-foreground">
                            {moduleKey.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {actions.map((act) => (
                            <span
                              key={act}
                              className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold uppercase"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    Last updated: {selectedRecord.updatedAt}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-xs"
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success(`Custom permissions for ${selectedRecord.name} synced!`);
                        setIsDialogOpen(false);
                      }}
                      className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Save &amp; Apply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

