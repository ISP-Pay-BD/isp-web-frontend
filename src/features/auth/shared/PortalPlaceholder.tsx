interface PortalPlaceholderProps {
  title: string;
  description?: string;
}

export function PortalPlaceholder({ title, description }: PortalPlaceholderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">
        {description ?? 'Module UI will be built in the parallel worktree for this portal.'}
      </p>
    </div>
  );
}
