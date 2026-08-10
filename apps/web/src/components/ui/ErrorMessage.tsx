interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps): JSX.Element {
  return (
    <div className="border-l-4 border-error bg-error/5 p-4 sm:p-6" role="alert">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-error mb-1">Error</p>
          <p className="text-text-primary font-body">{message}</p>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary text-sm py-2 px-4">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
