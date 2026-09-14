import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartTestPage from '../../../../src/app/technologies/[slug]/start/page';
import * as navigation from 'next/navigation';
import * as api from '../../../../src/lib/test-engine.api';
import { AuthProvider } from '../../../../src/lib/auth/auth-context';
import * as authApi from '../../../../src/lib/auth.api';
import * as technologyApi from '../../../../src/lib/technology.api';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('../../../../src/lib/test-engine.api', () => ({
  startPersonalQuiz: jest.fn(),
  startTest: jest.fn(),
}));

jest.mock('../../../../src/lib/auth.api', () => ({
  getMe: jest.fn(),
  login: jest.fn(),
  adminLogin: jest.fn(),
  register: jest.fn(),
}));

jest.mock('../../../../src/lib/technology.api', () => ({
  fetchTechnologyPreview: jest.fn(),
}));

describe('StartTestPage', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authApi.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        username: 'tester',
        role: 'user',
        credits: 10,
        companyId: null,
        availableAccessCodes: null,
        availableTests: null,
        firstName: 'Test',
        lastName: 'User',
        middleName: null,
        birthDate: '1990-01-01',
        country: 'US',
        city: null,
        phone: null,
      },
    });
    (navigation.useParams as jest.Mock).mockReturnValue({ slug: 'csharp' });
    (navigation.useRouter as jest.Mock).mockReturnValue({ push });
  });

  const renderWithAuth = (ui: React.ReactElement) => render(<AuthProvider>{ui}</AuthProvider>);

  const previewData = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'C#',
    slug: 'csharp',
    description: 'C# technology',
    questionSets: [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'C# Basics',
        questionCount: 10,
        actualQuestionCount: 42,
        durationMinutes: 20,
      },
    ],
    price: 1,
  };

  it('renders technology slug and start button', async () => {
    (technologyApi.fetchTechnologyPreview as jest.Mock).mockResolvedValue({
      success: true,
      data: previewData,
    });

    renderWithAuth(<StartTestPage />);
    expect(await screen.findByRole('heading', { name: 'C#' })).toBeInTheDocument();
    expect(screen.getByText('csharp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start quiz' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'C# Basics' })).toBeInTheDocument();
  });

  it('navigates to test session on success', async () => {
    (technologyApi.fetchTechnologyPreview as jest.Mock).mockResolvedValue({
      success: true,
      data: previewData,
    });
    (api.startPersonalQuiz as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (api.startTest as jest.Mock).mockResolvedValue({
      success: true,
      data: { sessionId: '550e8400-e29b-41d4-a716-446655440000' },
    });

    renderWithAuth(<StartTestPage />);
    await screen.findByRole('button', { name: 'Start quiz' });
    await userEvent.click(screen.getByRole('button', { name: 'Start quiz' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/tests/550e8400-e29b-41d4-a716-446655440000');
    });
  });

  it('shows error when start fails', async () => {
    (technologyApi.fetchTechnologyPreview as jest.Mock).mockResolvedValue({
      success: true,
      data: previewData,
    });
    (api.startPersonalQuiz as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (api.startTest as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderWithAuth(<StartTestPage />);
    await screen.findByRole('button', { name: 'Start quiz' });
    await userEvent.click(screen.getByRole('button', { name: 'Start quiz' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
