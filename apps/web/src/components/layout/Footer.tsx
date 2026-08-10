export function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 border-t">
      <div className="container mx-auto px-4 py-4 text-sm text-slate-600">
        © {year} EvaluateMe.IT · Architecture docs in{' '}
        <a href="/docs/architecture" className="underline">
          docs/architecture
        </a>
      </div>
    </footer>
  );
}
