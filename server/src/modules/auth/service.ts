import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';
import { SignupRequestBody, LoginRequestBody, LoginResult, CreateOrganizationRequestBody } from './types';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, Permission } from '../../utils/constants';
import { generateUniqueJoinCode } from '../../utils/orgCode';

// ─── Organization Creation & Signup Service ─────────────────────────────────────

/**
 * Creates a new Organization and its primary Administrator.
 *
 * NOTE: This is the ONLY place where a role is assigned directly based on a user's request.
 * It is tied directly to the creation of a new organization (an irreversible and auditable action),
 * ensuring roles cannot be elevated by checking a signup checkbox.
 */
export async function createOrganization(data: CreateOrganizationRequestBody): Promise<LoginResult & { joinCode: string }> {
  // Check if admin email already exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: data.adminEmail },
  });
  if (existingEmployee) {
    throw new AppError('Email is already registered.', HTTP.CONFLICT, ErrorCode.CONFLICT);
  }

  // Generate unique join code for the organization
  const joinCode = await generateUniqueJoinCode();
  const passwordHash = await bcrypt.hash(data.adminPassword, 12);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Organization
    const org = await tx.organization.create({
      data: {
        name: data.orgName,
        joinCode: joinCode,
      },
    });

    // 2. Seed Default Roles for the Organization
    // We enforce the strict 4-role model (ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
    const seededRoles = await Promise.all([
      tx.role.create({
        data: {
          organizationId: org.id,
          name: 'ADMIN',
          permissions: Object.values(Permission),
        },
      }),
      tx.role.create({
        data: {
          organizationId: org.id,
          name: 'ASSET_MANAGER',
          permissions: [
            Permission.VIEW_ASSETS,
            Permission.MANAGE_ASSETS,
            Permission.MANAGE_MAINTENANCE,
            Permission.MANAGE_AUDITS,
          ],
        },
      }),
      tx.role.create({
        data: {
          organizationId: org.id,
          name: 'DEPARTMENT_HEAD',
          permissions: [
            Permission.VIEW_ASSETS,
            Permission.BOOK_ASSETS,
            Permission.REQUEST_MAINTENANCE,
          ],
        },
      }),
      tx.role.create({
        data: {
          organizationId: org.id,
          name: 'EMPLOYEE',
          permissions: [
            Permission.VIEW_ASSETS,
            Permission.REQUEST_MAINTENANCE,
          ],
        },
      }),
    ]);

    const adminRole = seededRoles[0];

    // 3. Create Admin Employee
    const employee = await tx.employee.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        passwordHash,
        organizationId: org.id,
        roleId: adminRole.id,
      },
    });

    // 4. Log Organization Setup Activity
    await tx.activityLog.create({
      data: {
        organizationId: org.id,
        employeeId: employee.id,
        action: 'CREATED_ORGANIZATION',
        entityType: 'Organization',
        entityId: org.id,
      },
    });

    return { employee, roleName: adminRole.name };
  });

  // Generate JWT
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    {
      id: result.employee.id,
      email: result.employee.email,
      role: result.roleName,
      permissions: Object.values(Permission),
      departmentId: null,
      organizationId: result.employee.organizationId,
    },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'] },
  );

  return {
    token,
    joinCode,
    employee: {
      id: result.employee.id,
      name: result.employee.name,
      email: result.employee.email,
      role: result.roleName,
      departmentId: null,
      organizationId: result.employee.organizationId,
    },
  };
}

export async function signup(data: SignupRequestBody) {
  // Check if email already exists
  const existing = await prisma.employee.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError('Email is already registered.', HTTP.CONFLICT, ErrorCode.CONFLICT);
  }

  // Look up organization by join code
  const org = await prisma.organization.findUnique({
    where: { joinCode: data.joinCode.trim().toUpperCase() },
  });

  if (!org) {
    // Return a clear validation error without leaking details
    throw new AppError('Invalid organization code.', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Find the EMPLOYEE role for this organization
  const employeeRole = await prisma.role.findFirst({
    where: { organizationId: org.id, name: 'EMPLOYEE' },
  });

  if (!employeeRole) {
    throw new AppError('Role template not found for organization.', HTTP.SERVER_ERROR, ErrorCode.SERVER_ERROR);
  }

  // Create employee
  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      departmentId: data.departmentId || null,
      organizationId: org.id,
      roleId: employeeRole.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      departmentId: true,
      organizationId: true,
      status: true,
      role: { select: { name: true } },
    },
  });

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role.name,
    departmentId: employee.departmentId,
    status: employee.status,
  };
}

export async function login(data: LoginRequestBody): Promise<LoginResult> {
  const employee = await prisma.employee.findUnique({
    where: { email: data.email },
    include: { role: true },
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
      role: employee.role.name,
      permissions: employee.role.permissions,
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
      roleId: employee.roleId,
      departmentId: employee.departmentId,
      organizationId: employee.organizationId,
    },
  };
}
