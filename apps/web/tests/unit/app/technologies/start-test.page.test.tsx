import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartTestPage from '../../../../src/app/technologies/[slug]/start/page';
import * as navigation from 'next/navigation';
import * as api from '../../../../src/lib/test-engine.api';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('../../../../src/lib/test-engine.api', () => ({
  startTest: jest.fn(),
}));

describe('StartTestPage', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (navigation.useParams as jest.Mock).mockReturnValue({ slug: 'csharp' });
    (navigation.useRouter as jest.Mock).mockReturnValue({ push });
  });

  it('renders technology slug and start button', () => {
    render(<StartTestPage />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('csharp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Test' })).toBeInTheDocument();
  });

  it('navigates to test session on success', async () => {
    (api.startTest as jest.Mock).mockResolvedValue({
      success: true,
      data: { sessionId: '550e8400-e29b-41d4-a716-446655440000' },
    });

    render(<StartTestPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Start Test' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/tests/550e8400-e29b-41d4-a716-446655440000');
    });
  });

  it('shows error when start fails', async () => {
    (api.startTest as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<StartTestPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Start Test' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
