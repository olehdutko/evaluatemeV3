import Link from 'next/link';
import { AdminLoginForm } from '../../../../components/admin/AdminLoginForm';

export const metadata = {
  title: 'Admin · Log in',
};

export default function AdminLoginPage(): JSX.Element {
  return (
    <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-bg-secondary">
      <div className="w-full max-w-md">
        <div className="panel inverted">
          <div className="border-b border-inverted-border pb-4 mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-inverted-accent mb-3">Administration</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-inverted-primary">Admin Login</h1>
          </div>
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-text-secondary font-body text-sm">
          Looking for the public site?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover underline underline-offset-4">
            User login
          </Link>
        </p>
      </div>
    </div>
  );
}
