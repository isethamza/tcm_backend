import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  findOpen() {
    return this.prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: {
        booking: true,
        raisedBy: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  resolve(id: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }

  reject(id: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
      },
    });
  }
}
