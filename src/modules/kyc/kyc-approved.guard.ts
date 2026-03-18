import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';

@Injectable()
export class KycApprovedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Only required for these roles
    if (!['TRANSPORTEUR', 'HUB_MANAGER'].includes(user.role)) {
      return true;
    }

    const approvedKyc = await this.prisma.kyc.findFirst({
      where: {
        userId: user.id,
        status: KycStatus.APPROVED,
      },
    });

    if (!approvedKyc) {
      throw new ForbiddenException(
        'KYC approval required before performing this action',
      );
    }

    return true;
  }
}
