import { z } from 'zod';

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
  .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value), {
    message: 'Password must contain at least one special character',
  })
  .refine((value) => !/(.{2,}).*\1/.test(value), {
    message: 'Password must not contain repeated character sequences',
  });

export function validatePasswordQuality(password: string): { valid: boolean; errors: string[] } {
  const result = strongPasswordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors: result.error.issues.map((issue) => issue.message) };
}
