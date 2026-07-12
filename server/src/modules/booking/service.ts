import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, BookingStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';

export async function createBooking(employeeId: number, data: z.infer<typeof t.createBookingSchema>) {
  // App-level overlap check
  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId: data.assetId,
      status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
      OR: [
        { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } }
      ]
    },
    orderBy: { endTime: 'asc' }
  });

  if (overlapping) {
    // If overlapping, find next available time (for simplicity, we just suggest starting right after the overlapping booking)
    const suggestedStartTime = overlapping.endTime;
    const duration = data.endTime.getTime() - data.startTime.getTime();
    const suggestedEndTime = new Date(suggestedStartTime.getTime() + duration);

    throw new AppError(
      'This asset is already booked for that time.',
      HTTP.CONFLICT,
      ErrorCode.CONFLICT,
      {
        suggestedSlot: { startTime: suggestedStartTime, endTime: suggestedEndTime }
      }
    );
  }

  // The raw-SQL migration with GiST EXCLUDE constraint provides the final guarantee against race conditions.

  return prisma.booking.create({
    data: {
      assetId: data.assetId,
      bookedById: employeeId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: BookingStatus.UPCOMING,
    },
  });
}

export async function listBookings(query: z.infer<typeof t.searchBookingsSchema>) {
  return prisma.booking.findMany({
    where: { assetId: query.assetId },
    include: {
      bookedBy: { select: { name: true, email: true } },
      asset: { select: { name: true, tag: true } }
    },
    orderBy: { startTime: 'asc' }
  });
}

export async function cancelBooking(bookingId: number, reqEmployeeId: number) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (booking.bookedById !== reqEmployeeId) throw new AppError('Cannot cancel another user\'s booking', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);
  if (booking.status !== BookingStatus.UPCOMING) throw new AppError('Only upcoming bookings can be cancelled', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED }
  });
}
