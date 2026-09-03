import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'company', 'admin']);

export const registerRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: userRoleSchema,
    username: z.string().min(2).max(100),
    companyName: z.string().max(255).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    middleName: z.string().max(100).optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' }).optional(),
    country: z.string().min(1).max(100),
    city: z.string().max(100).optional(),
    phone: z.string().max(50).optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'company') {
        return typeof data.companyName === 'string' && data.companyName.trim().length > 0;
      }
      return typeof data.firstName === 'string' && data.firstName.trim().length > 0;
    },
    { message: 'First name is required for personal accounts', path: ['firstName'] },
  )
  .refine(
    (data) => {
      if (data.role === 'company') {
        return true;
      }
      return typeof data.lastName === 'string' && data.lastName.trim().length > 0;
    },
    { message: 'Last name is required for personal accounts', path: ['lastName'] },
  )
  .refine(
    (data) => {
      if (data.role === 'company') {
        return true;
      }
      return typeof data.birthDate === 'string' && data.birthDate.trim().length > 0;
    },
    { message: 'Date of birth is required for personal accounts', path: ['birthDate'] },
  );

export const registerResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    credits: z.number().int().min(0),
    companyName: z.string().max(255).nullable(),
    firstName: z.string().max(100).nullable(),
    lastName: z.string().max(100).nullable(),
    middleName: z.string().max(100).nullable(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    country: z.string().max(100).nullable(),
    city: z.string().max(100).nullable(),
    phone: z.string().max(50).nullable(),
    createdAt: z.string().datetime(),
  }),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const loginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    expiresInSeconds: z.number().int().positive(),
  }),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const refreshResponseSchema = loginResponseSchema;

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const emptySuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({}),
});

export const meResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    credits: z.number().int().min(0),
    firstName: z.string().max(100).nullable(),
    lastName: z.string().max(100).nullable(),
    middleName: z.string().max(100).nullable(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    country: z.string().max(100).nullable(),
    city: z.string().max(100).nullable(),
    phone: z.string().max(50).nullable(),
  }),
});

export const updateProfileRequestSchema = z.object({
  email: z.string().email().max(255).optional(),
  username: z.string().min(2).max(100).optional().or(z.literal('')),
  firstName: z.string().min(1).max(100).optional().or(z.literal('')),
  lastName: z.string().min(1).max(100).optional().or(z.literal('')),
  middleName: z.string().max(100).nullable().optional().or(z.literal('')),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().or(z.literal('')),
  country: z.string().min(1).max(100).optional().or(z.literal('')),
  city: z.string().max(100).nullable().optional().or(z.literal('')),
  phone: z.string().max(50).nullable().optional().or(z.literal('')),
});

export const updateProfileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    credits: z.number().int().min(0),
    firstName: z.string().max(100).nullable(),
    lastName: z.string().max(100).nullable(),
    middleName: z.string().max(100).nullable(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    country: z.string().max(100).nullable(),
    city: z.string().max(100).nullable(),
    phone: z.string().max(50).nullable(),
    updatedAt: z.string().datetime(),
  }),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
});

export const changePasswordResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    updatedAt: z.string().datetime(),
  }),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email().max(255),
});

export const forgotPasswordResponseSchema = emptySuccessSchema;

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1).max(255),
  newPassword: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
});

export const resetPasswordResponseSchema = changePasswordResponseSchema;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type LogoutResponse = z.infer<typeof emptySuccessSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
