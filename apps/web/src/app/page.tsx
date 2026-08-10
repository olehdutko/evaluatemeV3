import Link from 'next/link';

export default function HomePage(): JSX.Element {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex-grow flex items-center border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="max-w-4xl">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-accent mb-4 sm:mb-6">
              EvaluateMe.IT v3
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.05] tracking-tight text-balance">
              Prove what you know.
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-text-secondary max-w-prose font-body leading-relaxed">
              Create, run, and evaluate programming tests for teams, candidates, and personal growth.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/technologies" className="btn-primary text-center">
                Browse technologies
              </Link>
              <Link href="/register" className="btn-secondary text-center">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature index */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {[
            {
              number: '01',
              title: 'Technologies',
              description: 'Browse the catalog and pick a skill to evaluate.',
              href: '/technologies',
            },
            {
              number: '02',
              title: 'Health',
              description: 'Check API and database status in real time.',
              href: '/health',
            },
            {
              number: '03',
              title: 'Join',
              description: 'Log in or sign up to track your progress.',
              href: '/login',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-bg-primary p-6 sm:p-8 transition-colors duration-200 hover:bg-bg-secondary"
            >
              <span className="font-mono text-xs text-text-muted">{item.number}</span>
              <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                {item.title}
              </h2>
              <p className="mt-2 text-text-secondary font-body">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
