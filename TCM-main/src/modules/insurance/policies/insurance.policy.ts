import { BadRequestException } from '@nestjs/common';
import { Booking, InsurancePlan, BookingStatus } from '@prisma/client';

export class InsurancePolicy {
  static validateBooking(booking: Booking) {
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== BookingStatus.CREATED) {
      throw new BadRequestException(
        'Insurance can only be attached to pending bookings',
      );
    }
  }

  static validatePlan(plan: InsurancePlan) {
    if (!plan || !plan.active) {
      throw new BadRequestException('Invalid or inactive insurance plan');
    }
  }

  static ensureNoExistingInsurance(existing: any) {
    if (existing) {
      throw new BadRequestException(
        'Insurance already exists for this booking',
      );
    }
  }
}