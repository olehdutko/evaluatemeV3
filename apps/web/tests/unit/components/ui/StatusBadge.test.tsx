import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ok', 'bg-green-100'],
    ['error', 'bg-red-100'],
    ['pending', 'bg-yellow-100'],
  ])('renders %s badge with expected style', (status, expectedClass) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(status);
    expect(badge).toHaveClass(expectedClass);
  });
});
