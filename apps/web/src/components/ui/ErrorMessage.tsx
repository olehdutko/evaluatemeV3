interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps): JSX.Element {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
      <p>{message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
