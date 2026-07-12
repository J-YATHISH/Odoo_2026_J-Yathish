import { z } from 'zod';

// ─── Auth module type definitions ─────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  departmentId: z.number().int().positive().optional(),
});

export type SignupRequestBody = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequestBody = z.infer<typeof loginSchema>;

export interface LoginResult {
  token: string;
  employee: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    departmentId: number | null;
    organizationId: number;
  };
}
