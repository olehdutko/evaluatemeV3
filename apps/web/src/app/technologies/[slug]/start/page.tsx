import Link from 'next/link';
import { fetchTechnologyBySlug } from '../../../../lib/technology.api';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { getSessionUser } from '../../../../lib/auth/session';
import { StartQuizButton } from '../../../../components/quiz/StartQuizButton';

interface TechnologyDetailPageProps {
  params: { slug: string };
}

export default async function TechnologyDetailPage({
  params,
}: TechnologyDetailPageProps): Promise<JSX.Element> {
  const user = await getSessionUser();
  let technology;
  try {
    technology = await fetchTechnologyBySlug(params.slug);
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Technology" description="Unable to load technology details." />
        <ErrorMessage message="Unable to load technology details." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={technology.data.name}
        description={
          user
            ? 'Read-only technology details. Start a test when you are ready.'
            : 'Read-only technology details. Log in or register to start a test.'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel accent p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              About this technology
            </h2>
            <p className="mt-4 font-body text-text-secondary">
              {technology.data.description || 'No description available.'}
            </p>
          </div>
        </div>

        <div className="panel p-6 sm:p-8 h-fit space-y-4">
          <p className="label-mono">Slug</p>
          <p className="font-mono text-sm text-text-secondary">{technology.data.slug}</p>

          {user?.role === 'user' && (
            <StartQuizButton />
          )}

          {!user && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary font-body">
                Want to test your skills? Create an account or log in to start a quiz.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/register" className="btn-primary text-center">Sign up</Link>
                <Link href="/login" className="btn-secondary text-center">Log in</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
