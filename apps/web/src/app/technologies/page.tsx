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
      <>
        <PageHeader title="Technologies" description="Catalog of technologies available for tests." />
        <ErrorMessage message="Unable to load technologies." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Technologies" description="Catalog of technologies available for tests." />
      <ul className="space-y-4">
        {technologies.data.map((technology) => (
          <li key={technology.id} className="border rounded p-4 hover:bg-slate-50">
            <h2 className="font-semibold">{technology.name}</h2>
            <p className="text-slate-600">Slug: {technology.slug}</p>
            {technology.description && <p className="text-slate-600">{technology.description}</p>}
            <Link href={`/technologies/${technology.slug}/start`} className="text-blue-600 hover:underline mt-2 inline-block">
              Start Test
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
