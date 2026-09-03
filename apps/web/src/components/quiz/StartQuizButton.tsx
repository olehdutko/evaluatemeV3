'use client';

import { useAuth } from '../../lib/auth/auth-context';

interface StartQuizButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function StartQuizButton({ onClick, disabled = false, isLoading = false }: StartQuizButtonProps): JSX.Element | null {
  const { user } = useAuth();

  if (user?.role !== 'user') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full btn-primary text-center disabled:opacity-50"
    >
      {isLoading ? 'Starting…' : 'Start quiz'}
    </button>
  );
}
