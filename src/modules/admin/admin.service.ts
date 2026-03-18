import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    const users = await this.prisma.user.count();
    const trips = await this.prisma.trip.count({
      where: { status: 'PUBLISHED' },
    });
    const disputes = await this.prisma.dispute.count({
      where: { status: 'OPEN' },
    });
    const kycPending = await this.prisma.kyc.count({
      where: { status: 'PENDING' },
    });

    return { users, trips, disputes, kycPending };
  }

  async users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async kyc() {
    return this.prisma.kyc.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async disputes() {
    return this.prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async ledger() {
    return this.prisma.ledgerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async tracking() {
    return this.prisma.trackingEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async sla() {
    const trips = await this.prisma.trip.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return trips.map((t) => ({
      id: t.id,
      tripId: t.id,
      pickupDelay: 0,
      deliveryDelay: 0,
    }));
  }
}
