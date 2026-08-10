interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading…' }: LoadingProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 sm:py-16" role="status" aria-live="polite">
      <div className="flex gap-1">
        <span className="w-2 h-8 bg-accent animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-8 bg-accent animate-pulse" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-8 bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="font-mono text-sm uppercase tracking-wider text-text-secondary">{message}</p>
    </div>
  );
}
