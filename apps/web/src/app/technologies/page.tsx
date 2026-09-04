'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchTechnologies } from '../../lib/technology.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

interface Technology {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface TechnologiesListProps {
  technologies: Technology[];
}

function TechnologiesList({ technologies }: TechnologiesListProps): JSX.Element {
  return (
    <ul className="border-t border-border">
      {technologies.map((technology, index) => (
        <li key={technology.id} className="group border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 sm:py-6 px-2 sm:px-4 -mx-2 sm:-mx-4 transition-colors duration-200 hover:bg-bg-secondary">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="font-mono text-sm text-text-muted w-8 shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                  {technology.name}
                </h2>
                <p className="mt-1 font-mono text-xs text-text-muted">{technology.slug}</p>
                {technology.description && (
                  <p className="mt-2 text-text-secondary font-body max-w-prose">{technology.description}</p>
                )}
              </div>
            </div>
            <div className="shrink-0 sm:self-center">
              <Link
                href={`/technologies/${technology.slug}/start`}
                className="btn-secondary text-sm py-2 px-4 text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TechnologiesPage(): JSX.Element {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTechnologies()
      .then((response) => {
        if (!cancelled) setTechnologies(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load technologies.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Technologies"
        description="Catalog of technologies available for tests."
      />

      {isLoading ? (
        <p className="text-text-secondary font-body">Loading technologies…</p>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : technologies.length === 0 ? (
        <p className="text-text-secondary font-body">No technologies available yet.</p>
      ) : (
        <TechnologiesList technologies={technologies} />
      )}
    </div>
  );
}
