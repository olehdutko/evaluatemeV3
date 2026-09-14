'use client';

import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps): JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label + index} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-text-muted">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="text-accent hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-text-primary' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
