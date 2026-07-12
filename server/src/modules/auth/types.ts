import { z } from 'zod';

// ─── Auth module type definitions ─────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateOrganizationRequestBody = z.infer<typeof createOrganizationSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  joinCode: z.string().min(6, 'Join code must be at least 6 characters'),
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
    role: string;
    departmentId: number | null;
    organizationId: number;
  };
}
