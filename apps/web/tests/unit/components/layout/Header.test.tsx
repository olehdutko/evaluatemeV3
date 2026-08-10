import { render, screen } from '@testing-library/react';
import { Header } from '../../../../src/components/layout/Header';

describe('Header', () => {
  it('renders the logo and navigation links', () => {
    render(<Header />);

    expect(screen.getByText('EvaluateMe.IT')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Technologies' })).toHaveAttribute('href', '/technologies');
    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute('href', '/health');
  });
});
