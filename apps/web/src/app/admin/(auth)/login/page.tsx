import Link from 'next/link';
import { AdminLoginForm } from '../../../../components/admin/AdminLoginForm';

export const metadata = {
  title: 'Admin · Log in',
};

export default function AdminLoginPage(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg-secondary">
      <div className="w-full max-w-sm">
        <div className="panel p-6 sm:p-8">
          <div className="text-center mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-2">EvaluateMe.IT</p>
            <h1 className="font-display text-xl font-bold text-text-primary">Administration</h1>
          </div>
          <AdminLoginForm />
        </div>
        <p className="mt-5 text-center text-text-secondary font-body text-sm">
          Public site?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover underline underline-offset-4">
            User login
          </Link>
        </p>
      </div>
    </div>
  );
}
