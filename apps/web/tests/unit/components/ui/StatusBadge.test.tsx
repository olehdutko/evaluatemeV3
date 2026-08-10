import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ok', 'border-success text-success'],
    ['error', 'border-error text-error'],
    ['pending', 'border-info text-info'],
  ] as const)('renders %s badge with expected style', (status, expectedClass) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(status);
    expect(badge).toHaveClass(expectedClass);
  });
});
