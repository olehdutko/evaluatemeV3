import { render, screen } from '@testing-library/react';
import { PageHeader } from '../../../../src/components/ui/PageHeader';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Hello" description="World" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('renders only title when description is omitted', () => {
    render(<PageHeader title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('World')).not.toBeInTheDocument();
  });
});
