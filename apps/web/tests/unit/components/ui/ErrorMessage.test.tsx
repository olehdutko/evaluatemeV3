import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../../../../src/components/ui/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls retry when button clicked', async () => {
    const retry = jest.fn();
    render(<ErrorMessage message="Error" retry={retry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
