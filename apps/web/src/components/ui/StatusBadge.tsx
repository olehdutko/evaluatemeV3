interface StatusBadgeProps {
  status: 'ok' | 'error' | 'pending';
}

const styles: Record<StatusBadgeProps['status'], string> = {
  ok: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-sm font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
