import { z } from 'zod';

// eslint-disable-next-line no-useless-escape
const SPECIAL_CHARS_RE = /[!@#$%^&*()_+\-=[\]{};':"\|,.<>/?]/;

export const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .refine((value) => /[A-Z]/.test(value), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((value) => /[a-z]/.test(value), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((value) => /\d/.test(value), {
    message: 'Password must contain at least one digit',
  })
  .refine((value) => SPECIAL_CHARS_RE.test(value), {
    message: 'Password must contain at least one special character',
  })
  .refine((value) => !/(.{2,}).*\1/.test(value), {
    message: 'Password must not contain repeated character sequences',
  });

export function validatePasswordQuality(password: string): { valid: boolean; errors: string[]; score: number } {
  const result = strongPasswordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [], score: 5 };
  }
  const errors = result.error.issues.map((issue) => issue.message);

  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (SPECIAL_CHARS_RE.test(password)) score += 1;

  return { valid: false, errors, score };
}

export function passwordScoreLabel(score: number): { label: string; colorClass: string } {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Very weak', colorClass: 'bg-error' };
    case 2:
      return { label: 'Weak', colorClass: 'bg-warning' };
    case 3:
      return { label: 'Fair', colorClass: 'bg-warning/80' };
    case 4:
      return { label: 'Good', colorClass: 'bg-info' };
    case 5:
    default:
      return { label: 'Strong', colorClass: 'bg-success' };
  }
}
