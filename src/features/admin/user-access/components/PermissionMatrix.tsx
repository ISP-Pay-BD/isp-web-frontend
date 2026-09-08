'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { PermissionSectionDef } from '@/data/users';
import type { PermissionMap } from '@/types/auth';

interface PermissionMatrixProps {
  sections: PermissionSectionDef[];
  permissions: PermissionMap;
  onChange: (permissions: PermissionMap) => void;
  readOnly?: boolean;
}

const SECTION_COLORS: Record<string, string> = {
  // Semantic tones only — primary for product modules, muted for system
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

  return (
    <ScrollArea className="h-[min(60vh,520px)] rounded-xl border border-border/60 bg-muted/10">
      <div className="space-y-1 p-4">
        {sections.map((section) => {
          const sectionActions = permissions[section.key] ?? [];
          const totalActions = Object.keys(section.actions).length;
          const enabledCount = sectionActions.length;
          const allEnabled = enabledCount === totalActions;
          const someEnabled = enabledCount > 0 && !allEnabled;
          const isCollapsed = collapsed[section.key];
          const colorClass = SECTION_COLORS[section.key] ?? 'bg-muted/50 text-muted-foreground border-border/50';

          return (
            <div key={section.key} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-border/80 transition-colors">
              {/* Section Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-muted/20 transition-colors"
                onClick={() => toggleCollapse(section.key)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(section.key);
                  }}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{section.label}</span>
                <Badge variant="outline" className="ml-auto font-mono text-[10px] h-5 min-w-8 justify-center">
                  {enabledCount}/{totalActions}
                </Badge>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={allEnabled ? 'true' : someEnabled ? 'mixed' : 'false'}
                    disabled={readOnly}
                    onClick={() => toggleSection(section, !allEnabled)}
                    className={`h-4 w-4 rounded-sm border transition-colors flex items-center justify-center ${
                      allEnabled
                        ? 'bg-primary border-primary text-primary-foreground'
                        : someEnabled
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-input bg-background'
                    } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {allEnabled && (
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                    {someEnabled && !allEnabled && (
                      <div className="h-1 w-2 bg-current rounded-full" />
                    )}
                  </button>
                  <Label className="text-[10px] font-medium tracking-wide text-muted-foreground">All</Label>
                </div>
              </div>

              {/* Section Actions */}
              {!isCollapsed && (
                <div className="px-4 pb-3 pt-1 border-t border-border/30">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(section.actions).map(([action, label]) => {
                      const checked = permissions[section.key]?.includes(action) ?? false;
                      const id = `${section.key}-${action}`;
                      return (
                        <label
                          key={id}
                          htmlFor={id}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all duration-150 select-none ${
                            checked
                              ? 'bg-primary/5 border-primary/20 text-foreground shadow-sm'
                              : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40 hover:border-border/60'
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
                          <span className="font-medium text-xs">{label}</span>
                          {checked ? (
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground/30" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
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

  return (
    <div className="space-y-4">
      <PermissionMatrix
        sections={sections}
        permissions={permissions}
        onChange={setPermissions}
      />
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPermissions(initialPermissions)}
          className="gap-1.5"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="gap-1.5 font-semibold shadow-sm"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save permissions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
