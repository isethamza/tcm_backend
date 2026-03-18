import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SubmitClaimDto } from '../dto/submit-claim.dto';
import { ReviewClaimDto } from '../dto/review-claim.dto';
import { QueryClaimsDto } from '../dto/query-claims.dto';
import {
  InsuranceClaimStatus,
  InsuranceStatus,
} from '@prisma/client';
import { ClaimsPolicy } from './claims.policy';
import { InsuranceMapper } from '../mappers/insurance.mapper';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async submitClaim(dto: SubmitClaimDto) {
    const insurance = await this.prisma.bookingInsurance.findUnique({
      where: { id: dto.insuranceId },
      include: { claims: true },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    // ✅ policy enforcement
    ClaimsPolicy.validateClaimCreation(insurance, dto.claimedAmount);

    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.insuranceClaim.create({
        data: {
          insuranceId: dto.insuranceId,
          reason: dto.reason,
          description: dto.description,
          evidenceUrls: dto.evidenceUrls,
          claimedAmount: dto.claimedAmount,
          status: InsuranceClaimStatus.SUBMITTED,
        },
      });

      await tx.bookingInsurance.update({
        where: { id: dto.insuranceId },
        data: { status: InsuranceStatus.CLAIMED },
      });

      return InsuranceMapper.toClaimResponse(claim);
    });
  }

  async updateStatus(id: string, dto: ReviewClaimDto) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    // ✅ enforce state machine
    ClaimsPolicy.canTransition(claim.status, dto.status);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.insuranceClaim.update({
        where: { id },
        data: { status: dto.status },
      });

      // 💰 hook for payout
      if (dto.status === InsuranceClaimStatus.APPROVED) {
        // trigger payout service / ledger
      }

      if (dto.status === InsuranceClaimStatus.PAID) {
        await tx.bookingInsurance.update({
          where: { id: claim.insuranceId },
          data: { status: InsuranceStatus.ACTIVE }, // or CLOSED depending on your model
        });
      }

      return InsuranceMapper.toClaimResponse(updated);
    });
  }

  async getClaims(query: QueryClaimsDto) {
    const claims = await this.prisma.insuranceClaim.findMany({
      where: {
        status: query.status,
      },
      orderBy: { createdAt: 'desc' },
    });

    return claims.map(InsuranceMapper.toClaimResponse);
  }

  async getClaim(id: string) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id },
      include: {
        insurance: true,
      },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return InsuranceMapper.toClaimResponse(claim);
  }
}