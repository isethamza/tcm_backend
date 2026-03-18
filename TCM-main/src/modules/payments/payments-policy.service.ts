import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PaymentPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cash payment is allowed ONLY if:
   * - Admin explicitly enabled it
   * - For the given Transporteur or Hub Manager
   */
  async isCashAllowedForBooking(params: {
    transporteurId?: string;
    hubId?: string;
  }): Promise<boolean> {
    const { transporteurId, hubId } = params;

    if (transporteurId) {
      const user = await this.prisma.user.findUnique({
        where: { id: transporteurId },
        select: {
          role: true,
          cashAllowed: true,
        },
      });

      if (
        user &&
        user.role === UserRole.TRANSPORTEUR &&
        user.cashAllowed === true
      ) {
        return true;
      }
    }

    if (hubId) {
      const user = await this.prisma.user.findUnique({
        where: { id: hubId },
        select: {
          role: true,
          cashAllowed: true,
        },
      });

      if (
        user &&
        user.role === UserRole.HUB_MANAGER &&
        user.cashAllowed === true
      ) {
        return true;
      }
    }

    return false;
  }
}
