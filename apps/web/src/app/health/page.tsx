import { fetchHealth } from '../../lib/health.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default async function HealthPage(): Promise<JSX.Element> {
  let health;
  try {
    health = await fetchHealth();
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="System Health" description="API and database status." />
        <ErrorMessage message="Status: unavailable" />
      </div>
    );
  }

  const { status, database, latencyMs, timestamp } = health.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="System Health" description="API and database status." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="panel panel-hover p-5 sm:p-6">
          <p className="label-mono">API Status</p>
          <div className="mt-2"><StatusBadge status={status} /></div>
        </div>

        <div className="panel panel-hover p-5 sm:p-6">
          <p className="label-mono">Database</p>
          <div className="mt-2"><StatusBadge status={database} /></div>
        </div>

        <div className="panel panel-hover p-5 sm:p-6">
          <p className="label-mono">Latency</p>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-text-primary">{latencyMs} ms</p>
        </div>

        <div className="panel panel-hover p-5 sm:p-6">
          <p className="label-mono">Last check</p>
          <p className="mt-2 font-mono text-sm text-text-secondary">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}
