import prisma from '../../prisma/client';
import { z } from 'zod';
import * as t from './types';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode } from '../../utils/constants';

export async function listActivityLogs(organizationId: number, query: z.infer<typeof t.getNotificationsSchema>) {
  return prisma.activityLog.findMany({
    where: { organizationId },
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
