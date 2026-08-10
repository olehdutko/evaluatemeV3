import { render, screen } from '@testing-library/react';
import { Loading } from '../../../../src/components/ui/Loading';

describe('Loading', () => {
  it('renders loading text', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
