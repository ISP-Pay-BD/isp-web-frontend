'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { PermissionSectionDef } from '@/data/users';
import type { PermissionMap } from '@/types/auth';

interface PermissionMatrixProps {
  sections: PermissionSectionDef[];
  permissions: PermissionMap;
  onChange: (permissions: PermissionMap) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({
  sections,
  permissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const toggle = (menuKey: string, action: string, checked: boolean) => {
    const current = permissions[menuKey] ?? [];
    const next = checked
      ? [...new Set([...current, action])]
      : current.filter((a) => a !== action);
    onChange({ ...permissions, [menuKey]: next });
  };

  return (
    <ScrollArea className="h-[min(60vh,520px)] rounded-lg border pr-4">
      <div className="space-y-6 p-4">
        {sections.map((section) => (
          <div key={section.key} className="space-y-3">
            <h3 className="text-sm font-semibold">{section.label}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Object.entries(section.actions).map(([action, label]) => {
                const checked = permissions[section.key]?.includes(action) ?? false;
                const id = `${section.key}-${action}`;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={readOnly}
                      onCheckedChange={(value) =>
                        toggle(section.key, action, value === true)
                      }
                    />
                    <Label htmlFor={id} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                );
              })}
            </div>
            <Separator />
          </div>
        ))}
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save permissions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
