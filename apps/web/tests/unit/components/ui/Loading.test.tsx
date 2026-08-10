import { render, screen } from '@testing-library/react';
import { Loading } from '../../../../src/components/ui/Loading';

describe('Loading', () => {
  it('renders loading text', () => {
    render(<Loading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders custom loading message', () => {
    render(<Loading message="Fetching data" />);
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });
});
