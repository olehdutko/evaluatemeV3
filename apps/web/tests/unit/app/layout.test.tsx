import { render, screen } from '@testing-library/react';
import { Header } from '../../../src/components/layout/Header';
import { Footer } from '../../../src/components/layout/Footer';
import { AuthProvider } from '../../../src/lib/auth/auth-context';

describe('RootLayout composition', () => {
  it('renders header, children, and footer', () => {
    render(
      <AuthProvider>
        <div>
          <Header />
          <div data-testid="child">Child content</div>
          <Footer />
        </div>
      </AuthProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EvaluateMe.IT home' })).toHaveAttribute('href', '/');
  });
});
