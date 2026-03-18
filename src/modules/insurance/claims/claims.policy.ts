import { BadRequestException } from '@nestjs/common';
import {
  InsuranceClaimStatus,
  InsuranceStatus,
  BookingInsurance,
} from '@prisma/client';

export class ClaimsPolicy {
  static validateClaimCreation(
    insurance: BookingInsurance & { claims: any[] },
    claimedAmount: number,
  ) {
    if (insurance.status !== InsuranceStatus.ACTIVE) {
      throw new BadRequestException('Insurance not active');
    }

    if (claimedAmount > insurance.coverageAmount) {
      throw new BadRequestException('Claim exceeds coverage');
    }

    const existing = insurance.claims.find(
      (c) => c.status !== InsuranceClaimStatus.REJECTED,
    );

    if (existing) {
      throw new BadRequestException('Active claim already exists');
    }
  }

  static canTransition(
    current: InsuranceClaimStatus,
    next: InsuranceClaimStatus,
  ) {
    const transitions = {
      SUBMITTED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['PAID'],
      REJECTED: [],
      PAID: [],
    };

    if (!transitions[current]?.includes(next)) {
      throw new BadRequestException(
        `Invalid transition from ${current} to ${next}`,
      );
    }
  }
}