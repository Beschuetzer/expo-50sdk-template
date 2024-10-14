import { z } from 'zod';

export const EMAIL_SCHEMA = z.string().email();
export const PASSWORD_SCHEMA = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine(
    (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/.test(
        password,
      ),
    'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
  );
