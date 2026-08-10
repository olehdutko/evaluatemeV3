export function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            © {year} EvaluateMe.IT · v3
          </p>
          <a
            href="/docs/architecture"
            className="font-mono text-xs text-text-secondary hover:text-text-primary underline-offset-4 decoration-1 hover:underline"
          >
            Architecture docs
          </a>
        </div>
      </div>
    </footer>
  );
}
