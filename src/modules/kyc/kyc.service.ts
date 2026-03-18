import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus, KycType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { Multer } from 'multer';
import type { Express } from 'express';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // =========================
  // Submit KYC
  // =========================
  async submit(userId: string, files: Express.Multer.File[]) {
    if (!files || files.length < 2) {
      throw new BadRequestException('Missing documents');
    }

    const existing = await this.prisma.kyc.findFirst({
      where: { userId, status: KycStatus.PENDING },
    });

    if (existing) {
      throw new BadRequestException('KYC already submitted');
    }

    const [idDoc, selfie, license, insurance] = files;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const type =
      user.role === 'HUB_MANAGER'
        ? KycType.HUB_MANAGER
        : KycType.TRANSPORTEUR;

    return this.prisma.kyc.create({
      data: {
        userId,
        type,
        status: KycStatus.PENDING,
        idDocumentUrl: `/uploads/${idDoc.filename}`,
        selfieUrl: `/uploads/${selfie.filename}`,
        licenseUrl: license ? `/uploads/${license.filename}` : null,
		insuranceUrl: `/uploads/${insurance.filename}`,
      },
    });
  }

  // =========================
  // Admin — list pending
  // =========================
  findPending() {
    return this.prisma.kyc.findMany({
      where: {
        status: KycStatus.PENDING,
        type: { in: [KycType.TRANSPORTEUR, KycType.HUB_MANAGER] },
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================
  // Admin — approve
  // =========================
  async approve(kycId: string, adminId: string) {
    const kyc = await this.prisma.kyc.update({
      where: { id: kycId },
      data: {
        status: KycStatus.APPROVED,
        verifierId: adminId,
        verifiedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'KYC_APPROVED',
      entity: 'KYC',
      entityId: kycId,
      metadata: { userId: kyc.userId, type: kyc.type },
    });

    return kyc;
  }

  // =========================
  // Admin — reject
  // =========================
  async reject(kycId: string, adminId: string, reason: string) {
    const kyc = await this.prisma.kyc.update({
      where: { id: kycId },
      data: {
        status: KycStatus.REJECTED,
        verifierId: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'KYC_REJECTED',
      entity: 'KYC',
      entityId: kycId,
      metadata: { reason, userId: kyc.userId, type: kyc.type },
    });

    return kyc;
  }
}
