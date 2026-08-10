import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/technologies', label: 'Technologies' },
  { href: '/health', label: 'Health' },
];

export function Header(): JSX.Element {
  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          EvaluateMe.IT
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
