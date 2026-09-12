'use client';

import { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  FileText, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  CheckSquare,
  Square,
  X,
  Trash2,
  RotateCcw,
  Layers,
  UserPlus,
  Edit,
  Eye
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PERMISSION_CATEGORIES } from './PermissionMatrix';
import { 
  fullAdminPermissions, 
  resellerPermissions, 
  employeePermissions, 
  customerPermissions 
} from '@/data/users/permissions.data';

interface CustomAccessTableProps {
  records: CustomUserAccessRecord[];
  sections?: PermissionSectionDef[];
  onView?: (record: CustomUserAccessRecord) => void;
  onUpdateRecord?: (record: CustomUserAccessRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
  onAddRecord?: (newRecord: CustomUserAccessRecord) => void;
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

const ROLE_DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  admin: fullAdminPermissions,
  resellerAdmin: resellerPermissions,
  employee: employeePermissions,
  user: customerPermissions,
};

const ACTION_PRETTY_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  update_subscription: 'Update Subscription',
  update_conn: 'Update Connection',
  free_customer_create: 'Free User Create',
  self_recharge: 'Self Recharge',
  daily_payment_generate: 'Daily Bill Generate',
  invoice: 'Invoice Download',
  send_msg: 'Send Message',
  restore: 'Restore',
  delete_forever: 'Delete Forever',
  empty: 'Empty Trash',
  sync: 'Sync Users',
  payment: 'Online Payment',
  renew: 'Renew Subscription',
  chat: 'Access AI',
  ai: 'AI Auto-reply',
  utility: 'Utility Templates',
  authentication: 'Auth OTP',
  marketing: 'Marketing Campaigns',
};

const CANDIDATE_USERS = [
  { id: 'usr_101', name: 'Zubair Hossain (POP)', email: 'zubair.pop@demo.isppaybd.com', role: 'resellerAdmin' },
  { id: 'usr_102', name: 'Tariqul Islam (NOC)', email: 'tariqul.noc@demo.isppaybd.com', role: 'employee' },
  { id: 'usr_103', name: 'Nusrat Jahan (Billing)', email: 'nusrat.acc@demo.isppaybd.com', role: 'employee' },
  { id: 'usr_104', name: 'Green Valley ISP', email: 'greenvalley@demo.isppaybd.com', role: 'resellerAdmin' },
  { id: 'usr_105', name: 'VIP Enterprise Client', email: 'vip.corp@demo.isppaybd.com', role: 'user' },
];

export function CustomAccessTable({
  records,
  sections = [],
  onView,
  onUpdateRecord,
  onDeleteRecord,
  onAddRecord,
}: CustomAccessTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<CustomUserAccessRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Active editing permissions in dialog
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogCategory, setDialogCategory] = useState('all');

  // Add Dialog State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'resellerAdmin' | 'employee' | 'user'>('employee');

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
    setEditingPermissions(JSON.parse(JSON.stringify(record.permissions || {})));
    setDialogSearch('');
    setDialogCategory('all');
    setIsEditDialogOpen(true);
    onView?.(record);
  };

  const handleTogglePermission = (sectionKey: string, actionKey: string, checked: boolean) => {
    setEditingPermissions((prev) => {
      const current = prev[sectionKey] || [];
      const updated = checked
        ? [...new Set([...current, actionKey])]
        : current.filter((a) => a !== actionKey);

      const next = { ...prev };
      if (updated.length > 0) {
        next[sectionKey] = updated;
      } else {
        delete next[sectionKey];
      }
      return next;
    });
  };

  const handleToggleAllSection = (sectionKey: string, allActions: string[], enableAll: boolean) => {
    setEditingPermissions((prev) => {
      const next = { ...prev };
      if (enableAll) {
        next[sectionKey] = allActions;
      } else {
        delete next[sectionKey];
      }
      return next;
    });
  };

  const handleResetToRoleDefault = () => {
    if (!selectedRecord) return;
    const defaults = ROLE_DEFAULT_PERMISSIONS[selectedRecord.role] || {};
    setEditingPermissions(JSON.parse(JSON.stringify(defaults)));
    toast.info(`Reset permissions to ${ROLE_LABELS[selectedRecord.role]} defaults`);
  };

  const handleGrantAllDialog = () => {
    const next: Record<string, string[]> = {};
    sections.forEach((s) => {
      next[s.key] = Object.keys(s.actions);
    });
    setEditingPermissions(next);
    toast.success('Selected all permissions for this user');
  };

  const handleSetReadOnlyDialog = () => {
    const next: Record<string, string[]> = {};
    sections.forEach((s) => {
      const readActions = Object.keys(s.actions).filter((a) => a === 'read' || a.includes('view'));
      if (readActions.length > 0) {
        next[s.key] = readActions;
      } else if (Object.keys(s.actions).length > 0) {
        next[s.key] = [Object.keys(s.actions)[0]];
      }
    });
    setEditingPermissions(next);
    toast.success('Applied View-Only permissions');
  };

  const handleClearAllDialog = () => {
    setEditingPermissions({});
    toast.info('Cleared all permissions');
  };

  const handleSaveCustomPermissions = () => {
    if (!selectedRecord) return;
    const ruleCount = Object.values(editingPermissions).reduce((acc, curr) => acc + curr.length, 0);
    const updatedRecord: CustomUserAccessRecord = {
      ...selectedRecord,
      permissions: editingPermissions,
      customRulesCount: ruleCount,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onUpdateRecord?.(updatedRecord);
    toast.success(`Permissions updated for ${selectedRecord.name}`);
    setIsEditDialogOpen(false);
  };

  const handleDeleteOverride = () => {
    if (!selectedRecord) return;
    onDeleteRecord?.(selectedRecord.id);
    toast.success(`Custom override removed for ${selectedRecord.name}`);
    setIsEditDialogOpen(false);
  };

  const handleCreateNewOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[newUserRole] || {};
    const ruleCount = Object.values(defaultPerms).reduce((acc, curr) => acc + curr.length, 0);

    const newRecord: CustomUserAccessRecord = {
      id: `cua_${Date.now()}`,
      userId: `user_${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      customRulesCount: ruleCount,
      permissions: defaultPerms,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onAddRecord?.(newRecord);
    toast.success(`Custom access added for ${newRecord.name}`);
    setIsAddDialogOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    handleOpenDetails(newRecord);
  };

  const filteredDialogSections = useMemo(() => {
    return sections.filter((s) => {
      if (dialogCategory !== 'all') {
        const cat = PERMISSION_CATEGORIES.find((c) => c.id === dialogCategory);
        if (cat && !cat.keys.includes(s.key)) {
          return false;
        }
      }

      if (dialogSearch.trim()) {
        const q = dialogSearch.toLowerCase();
        const matchesName = s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q);
        const matchesAction = Object.entries(s.actions).some(
          ([key, label]) =>
            label.toLowerCase().includes(q) ||
            (ACTION_PRETTY_LABELS[key] && ACTION_PRETTY_LABELS[key].toLowerCase().includes(q))
        );
        return matchesName || matchesAction;
      }

      return true;
    });
  }, [sections, dialogCategory, dialogSearch]);

  const totalActiveCustomRules = Object.values(editingPermissions).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search custom user by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8.5 bg-muted/20 border-border/60 text-xs"
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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Role:
            </span>
            {Object.entries(ROLE_LABELS).map(([key, label]) => {
              const active = roleFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleFilter(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
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

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Custom Access
          </Button>
        </div>
      </div>

      {/* Main Table */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <p className="text-foreground text-sm font-semibold">No custom access users found</p>
          <p className="text-muted-foreground text-xs mt-1">
            {searchQuery ? `No matches for "${searchQuery}"` : 'No users have custom overrides configured.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="mt-3 text-xs h-8 gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add User Override
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">User</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Role</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Active Overrides</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Last Updated</TableHead>
                <TableHead className="py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                        {record.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {record.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          {record.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium gap-1 ${ROLE_COLORS[record.role] ?? 'bg-muted/50 text-muted-foreground'}`}
                    >
                      {ROLE_LABELS[record.role] || record.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {record.customRulesCount} rules enabled
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-mono text-xs text-muted-foreground">{record.updatedAt}</span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(record)}
                      className="h-7.5 gap-1.5 text-xs hover:border-primary hover:text-primary"
                    >
                      <Edit className="h-3 w-3" />
                      Edit Permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Clean Custom Permission Matrix Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[96vw] sm:max-w-4xl md:max-w-5xl bg-card border-border p-5 sm:p-6 shadow-xl max-h-[92vh] flex flex-col">
          {selectedRecord && (
            <>
              {/* Header */}
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <span>{selectedRecord.name}</span>
                      <Badge variant="outline" className={`text-xs ${ROLE_COLORS[selectedRecord.role]}`}>
                        {ROLE_LABELS[selectedRecord.role]}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {selectedRecord.email} · ID: {selectedRecord.userId}
                    </DialogDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono font-semibold self-start sm:self-auto">
                    {totalActiveCustomRules} Permissions Enabled
                  </Badge>
                </div>
              </DialogHeader>

              {/* Toolbar */}
              <div className="py-2.5 space-y-2 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search permissions..."
                      value={dialogSearch}
                      onChange={(e) => setDialogSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-muted/20 border-border/60"
                    />
                    {dialogSearch && (
                      <button
                        onClick={() => setDialogSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetToRoleDefault}
                      className="h-7.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Role Defaults
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGrantAllDialog}
                      className="h-7.5 px-2 text-xs text-primary"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSetReadOnlyDialog}
                      className="h-7.5 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Only
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllDialog}
                      className="h-7.5 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0 font-medium">
                    <Layers className="h-3.5 w-3.5" /> Category:
                  </span>
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const active = dialogCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDialogCategory(cat.id)}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors border ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clean Table Body */}
              <div className="flex-1 overflow-y-auto py-2 min-h-[300px]">
                {filteredDialogSections.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No matching permission modules.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
                        <tr>
                          <th className="py-2.5 px-3 w-[220px]">Module</th>
                          <th className="py-2.5 px-3">Allowed Actions</th>
                          <th className="py-2.5 px-3 text-right w-[100px]">Toggle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredDialogSections.map((section) => {
                          const sectionActions = editingPermissions[section.key] || [];
                          const allKeys = Object.keys(section.actions);
                          const isAll = allKeys.length > 0 && sectionActions.length === allKeys.length;

                          return (
                            <tr
                              key={section.key}
                              className={`hover:bg-muted/20 transition-colors ${
                                sectionActions.length > 0 ? 'bg-primary/[0.02]' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 align-top">
                                <div className="font-semibold text-foreground text-xs">
                                  {section.label}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  {sectionActions.length} of {allKeys.length} enabled
                                </div>
                              </td>

                              <td className="py-2.5 px-3 align-middle">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                  {Object.entries(section.actions).map(([actKey, defaultLabel]) => {
                                    const isChecked = sectionActions.includes(actKey);
                                    const labelText = ACTION_PRETTY_LABELS[actKey] || defaultLabel;
                                    const id = `dialog-${section.key}-${actKey}`;

                                    return (
                                      <label
                                        key={actKey}
                                        htmlFor={id}
                                        className={`inline-flex items-center gap-1.5 cursor-pointer select-none py-0.5 px-1.5 rounded transition-colors ${
                                          isChecked
                                            ? 'bg-primary/10 text-foreground font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                        }`}
                                      >
                                        <Checkbox
                                          id={id}
                                          checked={isChecked}
                                          onCheckedChange={(val) =>
                                            handleTogglePermission(section.key, actKey, val === true)
                                          }
                                          className="h-3.5 w-3.5"
                                        />
                                        <span className="text-xs">{labelText}</span>
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
                                  onClick={() =>
                                    handleToggleAllSection(section.key, allKeys, !isAll)
                                  }
                                  className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 font-medium"
                                >
                                  {isAll ? 'Deselect' : 'Select All'}
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

              {/* Modal Footer */}
              <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteOverride}
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2 self-start sm:self-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Custom Override
                </Button>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="text-xs h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveCustomPermissions}
                    className="bg-primary text-primary-foreground text-xs font-semibold h-8 px-4 shadow-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Custom User Override Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border p-5 shadow-xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Add Custom User Access
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select or enter a user to set specific permission overrides.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNewOverride} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Quick Pick User</Label>
              <div className="flex flex-wrap gap-1.5">
                {CANDIDATE_USERS.map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => {
                      setNewUserName(cand.name);
                      setNewUserEmail(cand.email);
                      setNewUserRole(cand.role as any);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded border border-border/60 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    {cand.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="custName" className="text-xs">Full Name</Label>
              <Input
                id="custName"
                placeholder="e.g. Tariqul Islam"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="h-8.5 text-xs bg-muted/20 border-border/60"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="custEmail" className="text-xs">Email Address</Label>
              <Input
                id="custEmail"
                type="email"
                placeholder="e.g. tariqul@demo.isppaybd.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="h-8.5 text-xs bg-muted/20 border-border/60"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Base Role</Label>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {(['employee', 'resellerAdmin', 'admin', 'user'] as const).map((r) => {
                  const active = newUserRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUserRole(r)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border/60 bg-muted/10 text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      <span>{ROLE_LABELS[r]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground text-xs font-semibold h-8 px-4"
              >
                Continue to Permissions
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
