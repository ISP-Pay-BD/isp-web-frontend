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
  ChevronRight,
  ChevronDown,
  Trash2,
  RotateCcw,
  Layers,
  UserPlus,
  Lock,
  AlertCircle,
  XCircle
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

// Candidates for adding new custom access
const CANDIDATE_USERS = [
  { id: 'usr_101', name: 'Zubair Hossain', email: 'zubair.pop@demo.isppaybd.com', role: 'resellerAdmin' },
  { id: 'usr_102', name: 'Tariqul Islam (NOC)', email: 'tariqul.noc@demo.isppaybd.com', role: 'employee' },
  { id: 'usr_103', name: 'Nusrat Jahan (Accounts)', email: 'nusrat.acc@demo.isppaybd.com', role: 'employee' },
  { id: 'usr_104', name: 'Green Valley ISP (Sub-POP)', email: 'greenvalley@demo.isppaybd.com', role: 'resellerAdmin' },
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

  // Active editing permissions in dialog
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogCategory, setDialogCategory] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Add Dialog State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'resellerAdmin' | 'employee' | 'user'>('employee');

  const handleOpenDetails = (record: CustomUserAccessRecord) => {
    setSelectedRecord(record);
    setEditingPermissions(JSON.parse(JSON.stringify(record.permissions || {})));
    setDialogSearch('');
    setDialogCategory('all');
    setCollapsedSections({});
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
    toast.info(`Reset permissions to ${ROLE_LABELS[selectedRecord.role]} defaults.`);
  };

  const handleGrantAllDialog = () => {
    const next: Record<string, string[]> = {};
    sections.forEach((s) => {
      next[s.key] = Object.keys(s.actions);
    });
    setEditingPermissions(next);
    toast.success('Granted all system permissions for this user.');
  };

  const handleClearAllDialog = () => {
    setEditingPermissions({});
    toast.info('Revoked all custom permissions.');
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
    toast.success(`Custom permissions for "${selectedRecord.name}" updated (${ruleCount} rules applied)!`);
    setIsEditDialogOpen(false);
  };

  const handleDeleteOverride = () => {
    if (!selectedRecord) return;
    onDeleteRecord?.(selectedRecord.id);
    toast.success(`Custom override removed for "${selectedRecord.name}". Reverted to default role.`);
    setIsEditDialogOpen(false);
  };

  const handleCreateNewOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please provide a valid user name and email address.');
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
    toast.success(`Custom access override added for ${newRecord.name}!`);
    setIsAddDialogOpen(false);
    setNewUserName('');
    setNewUserEmail('');

    // Open editor directly for immediate customization
    handleOpenDetails(newRecord);
  };

  const handleSelectCandidate = (candidate: typeof CANDIDATE_USERS[0]) => {
    setNewUserName(candidate.name);
    setNewUserEmail(candidate.email);
    setNewUserRole(candidate.role as any);
  };

  // Filter sections inside the dialog by category and search
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
        const matchesAction = Object.values(s.actions).some((act) => act.toLowerCase().includes(q));
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
      {/* Search & Custom Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search custom user by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/20 border-border/60 text-xs focus:border-primary"
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

          {/* Add Custom User Button */}
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Custom Override
          </Button>
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
              ? `No users match "${searchQuery}". Try adjusting your search query.`
              : 'No custom overrides configured for this role filter.'}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(searchQuery || roleFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="text-xs h-8"
              >
                Reset Filters
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add User Override
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-2xs backdrop-blur-xs">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">User Profile</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Role</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Active Overrides</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="py-3 font-semibold text-xs text-muted-foreground">Last Audit</TableHead>
                <TableHead className="py-3 text-right font-semibold text-xs text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="group border-b border-border/40 hover:bg-muted/30 transition-colors"
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
                      <span className="text-[10px] text-muted-foreground">active rules</span>
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
                      Manage &amp; Edit Permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Interactive Custom Permission Matrix Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[96vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl bg-card border-border/80 p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {selectedRecord && (
            <>
              {/* Modal Header */}
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-base text-primary shadow-xs">
                      {selectedRecord.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {selectedRecord.name}
                        <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 ${ROLE_COLORS[selectedRecord.role]}`}>
                          {ROLE_LABELS[selectedRecord.role]}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs font-mono mt-0.5 text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedRecord.email} · <span className="text-foreground/80">User ID: {selectedRecord.userId}</span>
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-mono font-bold text-primary shadow-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      {totalActiveCustomRules} Active Overrides
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Presets and Filters Toolbar */}
              <div className="py-2.5 space-y-2.5 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search permission modules or actions (e.g. 'Customer', 'MikroTik', 'Invoice')..."
                      value={dialogSearch}
                      onChange={(e) => setDialogSearch(e.target.value)}
                      className="pl-8 h-8.5 text-xs bg-muted/20 border-border/60 focus:border-primary"
                    />
                    {dialogSearch && (
                      <button
                        onClick={() => setDialogSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preset Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetToRoleDefault}
                      className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground border-border/60"
                      title="Reset to default permissions for this role"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Role Defaults
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGrantAllDialog}
                      className="h-8 px-2.5 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Grant All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllDialog}
                      className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Revoke All
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
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                            : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Module Checklist Body - 2 Column Grid */}
              <div className="flex-1 overflow-y-auto pr-1 py-3 min-h-[320px]">
                {filteredDialogSections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No modules found for current filters</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try clearing the search query or switching to &ldquo;All Modules&rdquo;.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDialogSections.map((section) => {
                      const sectionActions = Object.keys(section.actions);
                      const activeSectionActs = editingPermissions[section.key] || [];
                      const isAllEnabled =
                        sectionActions.length > 0 && activeSectionActs.length === sectionActions.length;
                      const isSomeEnabled = activeSectionActs.length > 0 && !isAllEnabled;
                      const isCollapsed = collapsedSections[section.key];

                      return (
                        <div
                          key={section.key}
                          className={`rounded-xl border transition-all shadow-2xs p-3.5 flex flex-col justify-between ${
                            activeSectionActs.length > 0
                              ? 'border-border/80 bg-card/90 ring-1 ring-primary/10'
                              : 'border-border/50 bg-card/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 border-b border-border/30">
                              <div
                                className="flex items-center gap-2 cursor-pointer select-none"
                                onClick={() =>
                                  setCollapsedSections((prev) => ({
                                    ...prev,
                                    [section.key]: !prev[section.key],
                                  }))
                                }
                              >
                                <button
                                  type="button"
                                  className="p-0.5 text-muted-foreground hover:text-foreground"
                                >
                                  {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                                <CheckCircle2
                                  className={`h-4 w-4 ${
                                    activeSectionActs.length > 0 ? 'text-primary' : 'text-muted-foreground/30'
                                  }`}
                                />
                                <span className="text-xs font-bold tracking-wider uppercase text-foreground">
                                  {section.label}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-mono h-5 px-1.5 font-bold ${
                                    isAllEnabled
                                      ? 'bg-primary/10 text-primary border-primary/30'
                                      : isSomeEnabled
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-muted/40 text-muted-foreground border-border/50'
                                  }`}
                                >
                                  {activeSectionActs.length} / {sectionActions.length}
                                </Badge>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleAllSection(section.key, sectionActions, !isAllEnabled)
                                }
                                className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
                              >
                                {isAllEnabled ? 'Deselect' : 'Select All'}
                              </Button>
                            </div>

                            {/* Action Buttons */}
                            {!isCollapsed && (
                              <div className="flex flex-wrap gap-1.5 pt-2.5">
                                {Object.entries(section.actions).map(([actKey, actLabel]) => {
                                  const isChecked = activeSectionActs.includes(actKey);
                                  return (
                                    <button
                                      key={actKey}
                                      type="button"
                                      onClick={() =>
                                        handleTogglePermission(section.key, actKey, !isChecked)
                                      }
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none ${
                                        isChecked
                                          ? 'bg-primary/15 border-primary/40 text-primary font-semibold shadow-xs ring-1 ring-primary/20'
                                          : 'bg-muted/20 border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                                      }`}
                                    >
                                      <span
                                        className={`h-2 w-2 rounded-full ${
                                          isChecked ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                      />
                                      <span>{actLabel}</span>
                                      <span className="text-[10px] font-mono opacity-50 uppercase">
                                        ({actKey})
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteOverride}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Override
                  </Button>
                  <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                    · Last updated: {selectedRecord.updatedAt}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="text-xs h-9 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveCustomPermissions}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 gap-1.5 shadow-md shadow-primary/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Save &amp; Apply Overrides
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Custom User Override Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border/80 p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Custom User Override
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure fine-grained custom access rules for a specific staff, reseller, or subscriber.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNewOverride} className="space-y-4 pt-2">
            {/* Quick Candidate Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Quick Pick Existing User</Label>
              <div className="flex flex-wrap gap-1.5">
                {CANDIDATE_USERS.map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => handleSelectCandidate(cand)}
                    className="text-[11px] px-2 py-1 rounded-md border border-border/60 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors text-left"
                  >
                    {cand.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custName" className="text-xs font-medium">Full Name</Label>
              <Input
                id="custName"
                placeholder="e.g. Tariqul Islam (NOC)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="h-9 text-xs bg-muted/20 border-border/60"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custEmail" className="text-xs font-medium">Email Address</Label>
              <Input
                id="custEmail"
                type="email"
                placeholder="e.g. tariqul.noc@demo.isppaybd.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="h-9 text-xs bg-muted/20 border-border/60"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Base Role (Inherits Default Policy)</Label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['employee', 'resellerAdmin', 'admin', 'user'] as const).map((r) => {
                  const active = newUserRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUserRole(r)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border/60 bg-muted/10 text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <Shield className={`h-3.5 w-3.5 ${active ? 'text-primary' : ''}`} />
                      <div className="text-xs">{ROLE_LABELS[r]}</div>
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
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 gap-1.5 shadow-md shadow-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Create &amp; Configure Rules
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
