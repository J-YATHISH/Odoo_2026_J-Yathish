import prisma from '../../prisma/client';
import { z } from 'zod';
import * as t from './types';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode } from '../../utils/constants';

export async function listActivityLogs(
  organizationId: number,
  userRole: string,
  userEmployeeId: number,
  userDepartmentId: number | null,
  query: z.infer<typeof t.getNotificationsSchema>
) {
  const whereClause: any = { organizationId };

  // Apply scoping depending on the role
  if (userRole === 'DEPARTMENT_HEAD') {
    whereClause.employee = { departmentId: userDepartmentId || -1 };
  } else if (userRole === 'EMPLOYEE') {
    whereClause.employeeId = userEmployeeId;
  }
  // ADMIN and ASSET_MANAGER see all logs for their organization

  return prisma.activityLog.findMany({
    where: whereClause,
    take: query.limit,
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { select: { name: true } },
    }
  });
}

export async function listMyNotifications(organizationId: number, employeeId: number) {
  return prisma.notification.findMany({
    where: { organizationId, employeeId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(organizationId: number, notificationId: number, employeeId: number) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.organizationId !== organizationId) throw new AppError('Notification not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (notif.employeeId !== employeeId) throw new AppError('Forbidden', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}
