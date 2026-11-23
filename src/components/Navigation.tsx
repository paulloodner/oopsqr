"use client";

import * as React from "react";

export interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex gap-2" aria-label="Fil d'Ariane">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span className="text-midnight/50 text-[0.75rem]">/</span>}
          {item.href ? (
            <a href={item.href} className="text-midnight/70 underline text-[0.85rem]">
              {item.label}
            </a>
          ) : (
            <span className="text-midnight-2 font-semibold text-[0.85rem]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-2.5 py-1 rounded-md text-midnight/60 hover:text-lime transition-colors disabled:opacity-40"
      >
        ←
      </button>
      <span className="text-midnight-2 font-medium text-sm">
        {page} / {total}
      </span>
      <button
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
        className="px-2.5 py-1 rounded-md text-midnight/60 hover:text-lime transition-colors disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}
