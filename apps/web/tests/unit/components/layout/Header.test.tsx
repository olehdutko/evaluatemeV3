import { render, screen } from '@testing-library/react';
import { Header } from '../../../../src/components/layout/Header';
import { AuthProvider } from '../../../../src/lib/auth/auth-context';

describe('Header', () => {
  it('renders the logo and navigation links', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>,
    );

    expect(screen.getByRole('link', { name: 'EvaluateMe.IT home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Technologies' })).toHaveAttribute('href', '/technologies');
    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute('href', '/health');
  });

  it('shows sign up and log in buttons when unauthenticated', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>,
    );

    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });
});
