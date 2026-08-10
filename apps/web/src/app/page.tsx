import Link from 'next/link';
import { PageHeader } from '../components/ui/PageHeader';

export default function HomePage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="EvaluateMe.IT"
        description="Create, run, and evaluate programming tests."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/technologies"
          className="block border rounded p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">Technologies</h2>
          <p className="text-slate-600">Browse the technology catalog.</p>
        </Link>
        <Link
          href="/health"
          className="block border rounded p-4 hover:bg-slate-50"
        >
          <h2 className="font-semibold">Health</h2>
          <p className="text-slate-600">Check API and database status.</p>
        </Link>
      </div>
    </>
  );
}
