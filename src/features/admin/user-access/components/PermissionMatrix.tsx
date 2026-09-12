'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  X, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  Layers,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { PermissionSectionDef } from '@/data/users';
import type { PermissionMap } from '@/types/auth';

interface PermissionMatrixProps {
  sections: PermissionSectionDef[];
  permissions: PermissionMap;
  onChange: (permissions: PermissionMap) => void;
  readOnly?: boolean;
}

export const PERMISSION_CATEGORIES = [
  {
    id: 'all',
    label: 'All Modules',
    keys: [] as string[],
  },
  {
    id: 'core',
    label: 'Customer & Ops',
    keys: ['customer', 'area', 'packages', 'Resellers', 'support_ticket', 'referral', 'recycle_bin'],
  },
  {
    id: 'finance',
    label: 'Billing & Accounting',
    keys: ['customer_payment', 'employee_payment', 'accounting', 'payment', 'subscription', 'inventory_purchess'],
  },
  {
    id: 'network',
    label: 'Network & Infra',
    keys: ['network', 'routers', 'olt', 'hotspot'],
  },
  {
    id: 'hr',
    label: 'Staff & Payroll',
    keys: ['employee', 'employee_attendance', 'advance_salary'],
  },
  {
    id: 'system',
    label: 'System & WhatsApp',
    keys: ['sms_message', 'reports', 'software_settings', 'user_access', 'profile_update', 'password_change', 'ai_chat', 'whatsapp_business', 'whatsapp_waha'],
  },
];

const SECTION_COLORS: Record<string, string> = {
  area: 'bg-primary/10 text-primary border-primary/20',
  packages: 'bg-primary/10 text-primary border-primary/20',
  customer: 'bg-primary/10 text-primary border-primary/20',
  employee: 'bg-muted text-muted-foreground border-border/60',
  employee_attendance: 'bg-muted text-muted-foreground border-border/60',
  advance_salary: 'bg-muted text-muted-foreground border-border/60',
  Resellers: 'bg-primary/10 text-primary border-primary/20',
  customer_payment: 'bg-primary/10 text-primary border-primary/20',
  employee_payment: 'bg-muted text-muted-foreground border-border/60',
  inventory_purchess: 'bg-muted text-muted-foreground border-border/60',
  network: 'bg-primary/10 text-primary border-primary/20',
  hotspot: 'bg-primary/10 text-primary border-primary/20',
  olt: 'bg-primary/10 text-primary border-primary/20',
  accounting: 'bg-muted text-muted-foreground border-border/60',
  support_ticket: 'bg-primary/10 text-primary border-primary/20',
  referral: 'bg-muted text-muted-foreground border-border/60',
  recycle_bin: 'bg-destructive/10 text-destructive border-destructive/20',
  sms_message: 'bg-primary/10 text-primary border-primary/20',
  reports: 'bg-muted text-muted-foreground border-border/60',
  software_settings: 'bg-muted text-muted-foreground border-border/60',
  user_access: 'bg-muted text-muted-foreground border-border/60',
  routers: 'bg-primary/10 text-primary border-primary/20',
  payment: 'bg-primary/10 text-primary border-primary/20',
  subscription: 'bg-primary/10 text-primary border-primary/20',
  profile_update: 'bg-muted text-muted-foreground border-border/60',
  password_change: 'bg-muted text-muted-foreground border-border/60',
  ai_chat: 'bg-muted text-muted-foreground border-border/60',
  whatsapp_business: 'bg-primary/10 text-primary border-primary/20',
  whatsapp_waha: 'bg-primary/10 text-primary border-primary/20',
};

export function PermissionMatrix({
  sections,
  permissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // Category match
      if (selectedCategory !== 'all') {
        const cat = PERMISSION_CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat && !cat.keys.includes(section.key)) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = section.label.toLowerCase().includes(q) || section.key.toLowerCase().includes(q);
        const matchesAction = Object.values(section.actions).some((label) =>
          label.toLowerCase().includes(q)
        );
        return matchesName || matchesAction;
      }

      return true;
    });
  }, [sections, selectedCategory, searchQuery]);

  const toggle = (menuKey: string, action: string, checked: boolean) => {
    const current = permissions[menuKey] ?? [];
    const next = checked
      ? [...new Set([...current, action])]
      : current.filter((a) => a !== action);
    onChange({ ...permissions, [menuKey]: next });
  };

  const toggleSection = (section: PermissionSectionDef, checked: boolean) => {
    const allActions = Object.keys(section.actions);
    const next = checked ? allActions : [];
    onChange({ ...permissions, [section.key]: next });
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGrantAllFiltered = () => {
    const next = { ...permissions };
    filteredSections.forEach((s) => {
      next[s.key] = Object.keys(s.actions);
    });
    onChange(next);
    toast.success('Granted all permissions for visible modules');
  };

  const handleClearAllFiltered = () => {
    const next = { ...permissions };
    filteredSections.forEach((s) => {
      delete next[s.key];
    });
    onChange(next);
    toast.info('Cleared permissions for visible modules');
  };

  const handleSetReadOnlyFiltered = () => {
    const next = { ...permissions };
    filteredSections.forEach((s) => {
      const readActions = Object.keys(s.actions).filter((a) => a === 'read' || a.includes('view'));
      if (readActions.length > 0) {
        next[s.key] = readActions;
      } else if (Object.keys(s.actions).length > 0) {
        next[s.key] = [Object.keys(s.actions)[0]];
      }
    });
    onChange(next);
    toast.success('Applied Read-Only preset to visible modules');
  };

  const handleExpandAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    sections.forEach((s) => {
      next[s.key] = !expand;
    });
    setCollapsed(next);
  };

  const totalPossibleRules = sections.reduce(
    (sum, s) => sum + Object.keys(s.actions).length,
    0
  );
  const totalActiveRules = Object.values(permissions).reduce(
    (sum, acts) => sum + acts.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Search and Category Control Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search permissions (e.g. 'Customer', 'MikroTik', 'Invoice')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/20 border-border/60 focus:border-primary"
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

          {/* Quick Presets */}
          {!readOnly && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGrantAllFiltered}
                className="h-8 px-2.5 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetReadOnlyFiltered}
                className="h-8 px-2.5 text-xs gap-1 border-border/60 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-3.5 w-3.5" />
                Read Only
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAllFiltered}
                className="h-8 px-2.5 text-xs gap-1 border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <XCircle className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleExpandAll(true)}
                className="h-8 px-2 text-xs text-muted-foreground"
                title="Expand All"
              >
                Expand All
              </Button>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 border-t border-border/40">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0">
            <Layers className="h-3.5 w-3.5" /> Category:
          </span>
          {PERMISSION_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix Grid */}
      <ScrollArea className="h-[min(65vh,560px)] rounded-xl border border-border/60 bg-muted/10">
        <div className="space-y-2 p-3 sm:p-4">
          {filteredSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No matching modules found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching with a different term or switch category filter.
              </p>
            </div>
          ) : (
            filteredSections.map((section) => {
              const sectionActions = permissions[section.key] ?? [];
              const totalActions = Object.keys(section.actions).length;
              const enabledCount = sectionActions.length;
              const allEnabled = totalActions > 0 && enabledCount === totalActions;
              const someEnabled = enabledCount > 0 && !allEnabled;
              const isCollapsed = collapsed[section.key];
              const colorClass = SECTION_COLORS[section.key] ?? 'bg-muted/50 text-muted-foreground border-border/50';

              return (
                <div
                  key={section.key}
                  className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-2xs hover:border-border/90 transition-all duration-150"
                >
                  {/* Section Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-muted/25 transition-colors"
                    onClick={() => toggleCollapse(section.key)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(section.key);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                      <CheckCircle2 className={`h-4 w-4 ${enabledCount > 0 ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground tracking-wide">
                        {section.label}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Key: {section.key}
                      </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[11px] h-5.5 px-2 font-bold ${
                          allEnabled
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : someEnabled
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-muted/40 text-muted-foreground border-border/50'
                        }`}
                      >
                        {enabledCount} / {totalActions}
                      </Badge>

                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section, !allEnabled)}
                          className="h-7 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          {allEnabled ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Section Actions Body */}
                  {!isCollapsed && (
                    <div className="px-4 pb-3.5 pt-2 border-t border-border/40 bg-muted/5">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(section.actions).map(([action, label]) => {
                          const checked = permissions[section.key]?.includes(action) ?? false;
                          const id = `${section.key}-${action}`;
                          return (
                            <label
                              key={id}
                              htmlFor={id}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-all duration-150 select-none ${
                                checked
                                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold shadow-xs ring-1 ring-primary/20'
                                  : 'bg-card border-border/50 text-muted-foreground hover:bg-muted/30 hover:border-border hover:text-foreground'
                              } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <Checkbox
                                id={id}
                                checked={checked}
                                disabled={readOnly}
                                onCheckedChange={(value) =>
                                  toggle(section.key, action, value === true)
                                }
                                className="h-3.5 w-3.5"
                              />
                              <span>{label}</span>
                              <span className="text-[10px] font-mono opacity-50 uppercase">({action})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface PermissionMatrixEditorProps {
  sections: PermissionSectionDef[];
  initialPermissions: PermissionMap;
  onSave: (permissions: PermissionMap) => Promise<void>;
}

export function PermissionMatrixEditor({
  sections,
  initialPermissions,
  onSave,
}: PermissionMatrixEditorProps) {
  const [permissions, setPermissions] = useState<PermissionMap>(initialPermissions);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(permissions);
      toast.success('Role permissions updated and applied across all assigned accounts!');
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(initialPermissions);

  return (
    <div className="space-y-4">
      <PermissionMatrix
        sections={sections}
        permissions={permissions}
        onChange={setPermissions}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {hasChanges ? (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved modifications pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              All changes synchronized with role policy
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPermissions(initialPermissions);
              toast.info('Reset to saved role permissions');
            }}
            disabled={!hasChanges || saving}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-1.5 font-semibold text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Applying Policy...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save &amp; Apply Role Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
