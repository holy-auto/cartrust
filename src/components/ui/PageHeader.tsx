import type { ReactNode } from "react";

interface PageHeaderProps {
  tag: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ tag, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <span className="inline-flex rounded-full border border-border-default bg-surface px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          {tag}
        </span>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {description && <p className="text-sm text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
