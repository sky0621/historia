"use client";

import { useState, type ReactNode } from "react";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export function CollapsibleFormSection({ title, defaultOpen = false, children, className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={defaultOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)} className={className}>
      <summary className="cursor-pointer list-none px-2 text-base font-semibold text-[var(--foreground-strong)] [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-[var(--muted)]">{isOpen ? "▼" : "▶"}</span>
          {title}
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
