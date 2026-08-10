import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestSessionPage from '../../../../src/app/tests/[sessionId]/page';
import * as navigation from 'next/navigation';
import * as api from '../../../../src/lib/test-engine.api';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('../../../../src/lib/test-engine.api', () => ({
  getTestSession: jest.fn(),
  submitAnswer: jest.fn(),
}));

describe('TestSessionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (navigation.useParams as jest.Mock).mockReturnValue({ sessionId: '550e8400-e29b-41d4-a716-446655440000' });
    (navigation.useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders loading state initially', () => {
    (api.getTestSession as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<TestSessionPage />);
    expect(screen.getByText('Loading test session')).toBeInTheDocument();
  });

  it('renders question and submits answer', async () => {
    const questionId = '550e8400-e29b-41d4-a716-446655440001';
    const answerId = '550e8400-e29b-41d4-a716-446655440002';

    (api.getTestSession as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'in_progress',
        score: null,
        currentQuestionIndex: 0,
        questions: [
          {
            id: questionId,
            content: 'What is 2+2?',
            type: 'single',
            orderIndex: 0,
            answers: [
              { id: answerId, content: '4', orderIndex: 0 },
              { id: '550e8400-e29b-41d4-a716-446655440003', content: '5', orderIndex: 1 },
            ],
          },
        ],
      },
    });

    (api.submitAnswer as jest.Mock).mockResolvedValue({
      success: true,
      data: { isCorrect: true, currentScore: 100, totalAnswered: 1, nextQuestionIndex: null, isComplete: true },
    });

    render(<TestSessionPage />);

    await waitFor(() => {
      expect(screen.getByText('Question 01 of 01')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('4'));
    await userEvent.click(screen.getByRole('button', { name: 'Finish Test' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tests/550e8400-e29b-41d4-a716-446655440000/results');
    });
  });
});
