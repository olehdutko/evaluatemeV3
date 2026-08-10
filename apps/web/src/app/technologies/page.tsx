import Link from 'next/link';
import { fetchTechnologies } from '../../lib/technology.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export default async function TechnologiesPage(): Promise<JSX.Element> {
  let technologies;
  try {
    technologies = await fetchTechnologies();
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Technologies" description="Catalog of technologies available for tests." />
        <ErrorMessage message="Unable to load technologies." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Technologies"
        description="Catalog of technologies available for tests."
      />

      {technologies.data.length === 0 ? (
        <p className="text-text-secondary font-body">No technologies available yet.</p>
      ) : (
        <ul className="border-t border-border">
          {technologies.data.map((technology, index) => (
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
                <Link
                  href={`/technologies/${technology.slug}/start`}
                  className="btn-primary text-sm py-2 px-4 shrink-0 sm:self-center"
                >
                  Start Test
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
