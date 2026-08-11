interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  inverted?: boolean;
}

export function ErrorMessage({ message, onRetry, inverted }: ErrorMessageProps): JSX.Element {
  return (
    <div
      className={`border-l-4 p-4 sm:p-6 ${
        inverted
          ? 'border-error bg-error/10'
          : 'border-error bg-error/5'
      }`}
      role="alert"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-error mb-1">Error</p>
          <p className={`font-body ${inverted ? 'text-inverted-primary' : 'text-text-primary'}`}>{message}</p>
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
