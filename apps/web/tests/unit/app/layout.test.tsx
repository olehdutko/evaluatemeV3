import { render, screen } from '@testing-library/react';
import { Header } from '../../../src/components/layout/Header';
import { Footer } from '../../../src/components/layout/Footer';

describe('RootLayout composition', () => {
  it('renders header, children, and footer', () => {
    render(
      <div>
        <Header />
        <div data-testid="child">Child content</div>
        <Footer />
      </div>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('EvaluateMe.IT')).toBeInTheDocument();
  });
});
