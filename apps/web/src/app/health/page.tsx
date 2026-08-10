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
      <>
        <PageHeader title="System Health" description="API and database status." />
        <ErrorMessage message="Status: unavailable" />
      </>
    );
  }

  const { status, database, latencyMs, timestamp } = health.data;

  return (
    <>
      <PageHeader title="System Health" description="API and database status." />
      <div className="space-y-2">
        <p>
          Status: <StatusBadge status={status} />
        </p>
        <p>
          Database: <StatusBadge status={database} />
        </p>
        <p>Latency: {latencyMs} ms</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    </>
  );
}
