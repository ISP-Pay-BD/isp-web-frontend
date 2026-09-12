'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Save, 
  Loader2, 
  Search, 
  X, 
  CheckSquare, 
  Square, 
  Eye, 
  RotateCcw,
  Shield,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    label: 'System & Messaging',
    keys: ['sms_message', 'reports', 'software_settings', 'user_access', 'profile_update', 'password_change', 'ai_chat', 'whatsapp_business', 'whatsapp_waha'],
  },
];

// Clean human-friendly action labels
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

export function PermissionMatrix({
  sections,
  permissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      if (selectedCategory !== 'all') {
        const cat = PERMISSION_CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat && !cat.keys.includes(section.key)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = section.label.toLowerCase().includes(q) || section.key.toLowerCase().includes(q);
        const matchesAction = Object.entries(section.actions).some(
          ([key, label]) =>
            label.toLowerCase().includes(q) ||
            (ACTION_PRETTY_LABELS[key] && ACTION_PRETTY_LABELS[key].toLowerCase().includes(q))
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

  const toggleSection = (section: PermissionSectionDef, enableAll: boolean) => {
    const allActions = Object.keys(section.actions);
    const next = enableAll ? allActions : [];
    onChange({ ...permissions, [section.key]: next });
  };

  const handleGrantAllFiltered = () => {
    const next = { ...permissions };
    filteredSections.forEach((s) => {
      next[s.key] = Object.keys(s.actions);
    });
    onChange(next);
    toast.success('Selected all permissions for visible modules');
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
    toast.success('Applied View-Only permissions');
  };

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search module (e.g. Customers, Invoices)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8.5 text-xs bg-background border-border/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGrantAllFiltered}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <CheckSquare className="h-3.5 w-3.5 text-primary" />
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetReadOnlyFiltered}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              View Only
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllFiltered}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Square className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1 shrink-0 font-medium">
          <Layers className="h-3.5 w-3.5" /> Filter:
        </span>
        {PERMISSION_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                active
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Clean Permission Matrix Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 w-[240px]">Feature / Module</th>
                <th className="py-3 px-4">Allowed Permissions</th>
                <th className="py-3 px-4 text-right w-[110px]">Toggle All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    No matching modules found.
                  </td>
                </tr>
              ) : (
                filteredSections.map((section) => {
                  const sectionActions = permissions[section.key] ?? [];
                  const allKeys = Object.keys(section.actions);
                  const isAll = allKeys.length > 0 && sectionActions.length === allKeys.length;
                  const isSome = sectionActions.length > 0 && !isAll;

                  return (
                    <tr
                      key={section.key}
                      className={`hover:bg-muted/20 transition-colors ${
                        sectionActions.length > 0 ? 'bg-primary/[0.02]' : ''
                      }`}
                    >
                      {/* Module Title */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${sectionActions.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                          {section.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {sectionActions.length} of {allKeys.length} enabled
                        </div>
                      </td>

                      {/* Clean Checkboxes */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                          {Object.entries(section.actions).map(([actKey, defaultLabel]) => {
                            const isChecked = sectionActions.includes(actKey);
                            const labelText = ACTION_PRETTY_LABELS[actKey] || defaultLabel;
                            const id = `matrix-${section.key}-${actKey}`;

                            return (
                              <label
                                key={actKey}
                                htmlFor={id}
                                className={`inline-flex items-center gap-2 cursor-pointer select-none py-1 px-2 rounded-md transition-colors ${
                                  isChecked
                                    ? 'bg-primary/10 text-foreground font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                <Checkbox
                                  id={id}
                                  checked={isChecked}
                                  disabled={readOnly}
                                  onCheckedChange={(val) => toggle(section.key, actKey, val === true)}
                                  className="h-4 w-4"
                                />
                                <span className="text-xs">{labelText}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>

                      {/* Row Toggle */}
                      <td className="py-3 px-4 align-middle text-right">
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection(section, !isAll)}
                            className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 font-medium"
                          >
                            {isAll ? 'Deselect' : 'Select All'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
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
      toast.success('Permissions saved successfully');
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
      
      {/* Clean Footer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          {hasChanges ? (
            <span className="text-amber-500 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              You have unsaved changes
            </span>
          ) : (
            <span>All permissions synchronized</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPermissions(initialPermissions);
              toast.info('Changes discarded');
            }}
            disabled={!hasChanges || saving}
            className="text-xs h-9 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="text-xs h-9 px-4 gap-1.5 font-semibold bg-primary text-primary-foreground shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
