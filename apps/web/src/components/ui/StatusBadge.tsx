type BadgeStatus = 'ok' | 'healthy' | 'error' | 'unhealthy' | 'warning' | 'info' | 'pending';

interface StatusBadgeProps {
  status: BadgeStatus;
}

const colorMap: Record<string, string> = {
  ok: 'border-success text-success',
  healthy: 'border-success text-success',
  error: 'border-error text-error',
  unhealthy: 'border-error text-error',
  warning: 'border-warning text-warning',
  info: 'border-info text-info',
  pending: 'border-info text-info',
};

export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const normalized = status.toLowerCase();
  const colorClass = colorMap[normalized] ?? colorMap.info;

  return (
    <span className={`inline-block border-l-4 px-3 py-1 font-mono text-xs uppercase tracking-wider bg-bg-secondary ${colorClass}`}>
      {status}
    </span>
  );
}
