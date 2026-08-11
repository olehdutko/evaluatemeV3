import Link from 'next/link';
import { LoginForm } from '../../components/auth/LoginForm';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

export const metadata = {
  title: 'Log in',
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="min-h-[calc(100vh-9rem)] flex flex-col lg:flex-row">
      {/* Left: statement */}
      <section className="flex items-end lg:items-center bg-bg-secondary border-b lg:border-b-0 lg:border-r border-border px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16 lg:w-1/2">
        <div className="max-w-md">
          <p className="font-mono text-sm uppercase tracking-[0.12em] text-accent mb-4">Members</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
            Welcome back.
          </h1>
          <p className="mt-4 text-text-secondary font-body">
            Log in to track your tests, review scores, and manage your team.
          </p>
        </div>
      </section>

      {/* Right: form */}
      <section className="flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16 lg:w-1/2 bg-bg-primary">
        <div className="w-full max-w-md">
          <div className="panel accent space-y-6">
            <LoginForm />
            <div className="relative border-t border-border pt-6">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-bg-primary px-2 font-mono text-xs text-text-secondary">
                or
              </span>
              <GoogleAuthButton role="user" mode="login" />
            </div>
          </div>
          <p className="mt-6 text-center text-text-secondary font-body text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent hover:text-accent-hover underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
