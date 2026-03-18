import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingInsuranceDto } from './dto/create-booking-insurance.dto';
import { InsuranceStatus } from '@prisma/client';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async attachInsurance(dto: CreateBookingInsuranceDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const existing = await this.prisma.bookingInsurance.findUnique({
	where: {
		bookingId_status: {
		bookingId: dto.bookingId,
		status: 'ACTIVE',
		},
	}    });

    if (existing) {
      throw new BadRequestException('Insurance already exists');
    }

    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || !plan.active) {
      throw new NotFoundException('Active insurance plan not found');
    }

    // ✅ SOURCE OF TRUTH
    const declaredValue = Number(booking.totalPrice);

    const premium = Math.max(
      (declaredValue * plan.percentageRate) / 100,
      plan.minPremium,
    );

    const coverage = Math.min(declaredValue, plan.maxCoverage);

    return this.prisma.bookingInsurance.create({
      data: {
        bookingId: dto.bookingId,
        planId: dto.planId,
        declaredValue,
        premiumAmount: premium,
        coverageAmount: coverage,
        status: InsuranceStatus.ACTIVE,
      },
    });
  }

  async getInsurance(id: string) {
    const insurance = await this.prisma.bookingInsurance.findUnique({
      where: { id },
      include: {
        claims: true,
        plan: true,
        booking: true,
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    return insurance;
  }
}