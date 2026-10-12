'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Can, ConfirmDialog, EmptyState } from '@/components/shared';
import type { ApiError } from '@/lib/api/client';
import {
  useCategoryMutation,
  useLedgerCategories,
  type LedgerCategory,
  type LedgerKind,
} from './api';

interface ManageCategoriesDialogProps {
  kind: LedgerKind;
  noun: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Backend field message for `name` when present, else the human message (e.g. 409 "in use"). */
function categoryError(e: ApiError): string {
  const d = e.details?.name;
  return (Array.isArray(d) ? d[0] : d) || e.message;
}

export function ManageCategoriesDialog({
  kind,
  noun,
  open,
  onOpenChange,
}: ManageCategoriesDialogProps) {
  const categories = useLedgerCategories(kind);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [toDelete, setToDelete] = useState<LedgerCategory | null>(null);
  const [error, setError] = useState('');
  const mutation = useCategoryMutation(kind, (e) => setError(categoryError(e)));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError('');
    mutation.mutate(
      { type: 'create', name },
      {
        onSuccess: () => {
          setNewName('');
          toast.success(`Category "${name}" added`);
        },
      },
    );
  };

  const rename = () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    setError('');
    mutation.mutate(
      { type: 'rename', id: editing.id, name },
      {
        onSuccess: () => {
          setEditing(null);
          toast.success('Category renamed');
        },
      },
    );
  };

  const remove = () => {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null);
    setError('');
    mutation.mutate(
      { type: 'delete', id: target.id },
      { onSuccess: () => toast.success(`Category "${target.name}" deleted`) },
    );
  };

  const list = categories.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{noun} categories</DialogTitle>
          <DialogDescription>Categories offered when recording {noun} entries.</DialogDescription>
        </DialogHeader>

        <Can menu="accounting" action="create">
          <form onSubmit={add} className="flex items-center gap-2">
            <Input
              placeholder="New category name"
              aria-label="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5 text-xs"
              disabled={!newName.trim() || mutation.isPending}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </form>
        </Can>

        {error && <p className="text-destructive text-xs">{error}</p>}

        <div className="border-border/60 divide-border/40 max-h-80 divide-y overflow-y-auto rounded-lg border">
          {categories.isPending ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : categories.isError ? (
            <EmptyState
              className="border-0 py-8"
              title="Could not load categories"
              description={categories.error.message}
              actionLabel="Retry"
              onAction={() => categories.refetch()}
            />
          ) : list.length === 0 ? (
            <p className="text-muted-foreground p-4 text-center text-xs">
              No categories yet. Add the first one above.
            </p>
          ) : (
            list.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 px-3 py-2">
                {editing?.id === c.id ? (
                  <>
                    <Input
                      autoFocus
                      aria-label="Category name"
                      value={editing.name}
                      onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          rename();
                        }
                        if (e.key === 'Escape') setEditing(null);
                      }}
                      className="h-8 text-xs"
                    />
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-400"
                        aria-label="Save name"
                        disabled={!editing.name.trim() || mutation.isPending}
                        onClick={rename}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Cancel"
                        onClick={() => setEditing(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-foreground truncate text-xs font-medium">{c.name}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Can menu="accounting" action="update">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-7 w-7"
                          aria-label={`Rename ${c.name}`}
                          onClick={() => {
                            setError('');
                            setEditing({ id: c.id, name: c.name });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Can>
                      <Can menu="accounting" action="delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          aria-label={`Delete ${c.name}`}
                          disabled={mutation.isPending}
                          onClick={() => setToDelete(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Can>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Nested so the confirmation stacks on top of this dialog. */}
        <ConfirmDialog
          open={!!toDelete}
          onOpenChange={(o) => !o && setToDelete(null)}
          title="Delete category"
          description={`Delete "${toDelete?.name ?? ''}"? Categories that are used by entries cannot be deleted.`}
          confirmLabel="Delete"
          destructive
          onConfirm={remove}
        />
      </DialogContent>
    </Dialog>
  );
}
