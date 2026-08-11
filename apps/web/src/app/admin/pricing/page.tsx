import { CreditSettingsPanel } from '../../../components/admin/CreditSettingsPanel';

export const metadata = {
  title: 'Admin · Pricing & Credits',
};

export default function AdminPricingPage(): JSX.Element {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Commerce</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Pricing & Credits</h1>
      </header>

      <CreditSettingsPanel />
    </div>
  );
}
