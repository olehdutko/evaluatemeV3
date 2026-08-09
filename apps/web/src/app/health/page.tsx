import { fetchHealth } from '../../lib/health.api';

export default async function HealthPage() {
  let health;
  try {
    health = await fetchHealth();
  } catch {
    return (
      <main>
        <h1>System Health</h1>
        <p>Status: unavailable</p>
      </main>
    );
  }

  return (
    <main>
      <h1>System Health</h1>
      <p>Status: {health.data.status}</p>
      <p>Database: {health.data.database}</p>
      <p>Latency: {health.data.latencyMs} ms</p>
      <p>Timestamp: {health.data.timestamp}</p>
    </main>
  );
}
