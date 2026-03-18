import { BookingStatus } from '@prisma/client';

export type PdfWatermark =
  | 'PAID'
  | 'PAY_AT_PICKUP'
  | 'CANCELLED'
  | null;

export function resolveBookingWatermark(booking: {
  status: BookingStatus;
  remainingAmount: number;
}): PdfWatermark {
  if (booking.status === BookingStatus.CANCELLED) {
    return 'CANCELLED';
  }

  if (booking.remainingAmount <= 0) {
    return 'PAID';
  }

  return 'PAY_AT_PICKUP';
}
