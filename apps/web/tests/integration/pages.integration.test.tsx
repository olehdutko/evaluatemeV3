import { render, screen } from '@testing-library/react';
import HomePage from '../../src/app/page';

describe('Pages', () => {
  it('renders the home page with navigation cards', () => {
    render(<HomePage />);
    expect(screen.getByText('EvaluateMe.IT')).toBeInTheDocument();
    expect(screen.getByText('Browse the technology catalog.')).toBeInTheDocument();
    expect(screen.getByText('Check API and database status.')).toBeInTheDocument();
  });
});
