export const metadata = {
  title: 'Admin · Dashboard',
};

export default function AdminDashboardPage(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Administration</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Dashboard</h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="panel panel-hover p-6 flex flex-col gap-2"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-accent">{card.category}</span>
            <h2 className="font-display text-xl font-bold text-text-primary">{card.title}</h2>
            <p className="text-text-secondary font-body text-sm">{card.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

const cards = [
  {
    href: '/admin/pricing',
    category: 'Commerce',
    title: 'Pricing & Credits',
    description: 'Manage packages, credits per test, and billing rules.',
  },
  {
    href: '/admin/email-templates',
    category: 'Messaging',
    title: 'Email Templates',
    description: 'Edit transactional and marketing templates.',
  },
  {
    href: '/admin/landing-ads',
    category: 'Marketing',
    title: 'Landing Ads',
    description: 'Control hero ads and promo banners.',
  },
  {
    href: '/admin/users',
    category: 'Access',
    title: 'Users',
    description: 'Browse accounts, change roles and activation status.',
  },
  {
    href: '/admin/technologies',
    category: 'Content',
    title: 'Technologies',
    description: 'Add, edit and publish technology stacks.',
  },
  {
    href: '/admin/questions',
    category: 'Content',
    title: 'Questions & Answers',
    description: 'Manage question banks and scoring rules.',
  },
];
