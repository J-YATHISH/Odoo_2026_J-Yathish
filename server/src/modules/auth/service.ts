import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';
import { SignupRequestBody, LoginRequestBody, LoginResult } from './types';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Auth service ─────────────────────────────────────────────────────────────

export async function signup(data: SignupRequestBody) {
  // Check if email already exists
  const existing = await prisma.employee.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError('Email is already registered.', HTTP.CONFLICT, ErrorCode.CONFLICT);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Find or create organization
  let org = await prisma.organization.findUnique({
    where: { name: data.organizationName }
  });

  let isNewOrg = false;
  if (!org) {
    org = await prisma.organization.create({
      data: { name: data.organizationName }
    });
    isNewOrg = true;
  }

  // Create employee. If this is a brand new organization, the first user is an ADMIN.
  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      departmentId: data.departmentId,
      organizationId: org.id,
      role: isNewOrg ? 'ADMIN' : 'EMPLOYEE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      organizationId: true,
      status: true,
    },
  });

  return employee;
}

export async function login(data: LoginRequestBody): Promise<LoginResult> {
  const employee = await prisma.employee.findUnique({
    where: { email: data.email },
  });

  if (!employee) {
    throw new AppError('Invalid email or password.', HTTP.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }

  if (employee.status !== 'ACTIVE') {
    throw new AppError('This account has been deactivated.', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);
  }

  const isValidPassword = await bcrypt.compare(data.password, employee.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password.', HTTP.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }

  // Generate JWT
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    {
      id: employee.id,
      email: employee.email,
      role: employee.role,
      departmentId: employee.departmentId,
      organizationId: employee.organizationId,
    },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'] },
  );

  // Record login in ActivityLog
  await prisma.activityLog.create({
    data: {
      organizationId: employee.organizationId,
      employeeId: employee.id,
      action: 'LOGGED_IN',
      entityType: 'Employee',
      entityId: employee.id,
    },
  });

  return {
    token,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      departmentId: employee.departmentId,
      organizationId: employee.organizationId,
    },
  };
}
