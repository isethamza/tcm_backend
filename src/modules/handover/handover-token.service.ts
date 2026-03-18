import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HandoverService } from './handover.service';
import * as crypto from 'crypto';

@Injectable()
export class HandoverTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly handoverService: HandoverService,
  ) {}

  /* =====================================================
     GENERATE BATCH QR TOKEN
  ===================================================== */
  async generateBatchToken(batchId: string, operatorId: string) {
    const token = crypto.randomUUID();
    return this.prisma.handoverToken.create({
      data: {
        token,
        batchId,
        createdById: operatorId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiration
      },
    });
  }

  /* =====================================================
     GENERATE PARCEL QR TOKEN
  ===================================================== */
  async generateParcelToken(parcelId: string, operatorId: string) {
    const token = crypto.randomUUID();
    return this.prisma.handoverToken.create({
      data: {
        token,
        parcelId,
        createdById: operatorId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiration
      },
    });
  }

  /* =====================================================
     PROCESS SCAN (BATCH OR PARCEL)
  ===================================================== */
  async processScan(token: string, operatorId: string) {
    const record = await this.prisma.handoverToken.findUnique({
      where: { token },
    });

    if (!record) throw new NotFoundException('Invalid token');
    if (record.isUsed) {
      throw new BadRequestException('Token already used');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    // Mark token as used
    await this.prisma.handoverToken.update({
      where: { token },
      data: { isUsed: true },
    });

    /* ============================
       BATCH HANDOVER
    ============================ */
    if (record.batchId) {
      return this.handoverService.create(
        { batchId: record.batchId, toType: 'HUB_MANAGER' },
        operatorId,
      );
    }

    /* ============================
       PARCEL HANDOVER
    ============================ */
    if (record.parcelId) {
      return this.handoverService.create(
        { parcelId: record.parcelId, toType: 'RECIPIENT' },
        operatorId,
      );
    }

    throw new BadRequestException('Invalid token scope');
  }
}