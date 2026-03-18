import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntryType } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     RECORD PAYMENT
  ===================================================== */
  async recordForPayment(params: {
    paymentId: string;

    totalAmount: number;
    platformCommission: number;
    vatAmount?: number;

    transporteurAmount: number;
    transporteurId: string;

    hubAmount?: number;
    hubId?: string;

    insuranceAmount?: number;
  }) {
    if (!params.paymentId) {
      throw new BadRequestException('paymentId is required');
    }

    const writes = [];

    // CLIENT PAYMENT
    writes.push(
      this.prisma.ledgerEntry.create({
        data: {
          payment: { connect: { id: params.paymentId } },
          type: LedgerEntryType.CLIENT_PAYMENT,
          amount: params.totalAmount,
        },
      }),
    );

    // PLATFORM COMMISSION
    if (params.platformCommission > 0) {
      writes.push(
        this.prisma.ledgerEntry.create({
          data: {
            payment: { connect: { id: params.paymentId } },
            type: LedgerEntryType.PLATFORM_COMMISSION,
            amount: params.platformCommission,
          },
        }),
      );
    }

    // VAT
    if (params.vatAmount && params.vatAmount > 0) {
      writes.push(
        this.prisma.ledgerEntry.create({
          data: {
            payment: { connect: { id: params.paymentId } },
            type: LedgerEntryType.VAT,
            amount: params.vatAmount,
          },
        }),
      );
    }

    // TRANSPORTEUR PAYOUT
    if (params.transporteurAmount > 0) {
      writes.push(
        this.prisma.ledgerEntry.create({
          data: {
            payment: { connect: { id: params.paymentId } },
            transporteurId: params.transporteurId,
            type: LedgerEntryType.TRANSPORTEUR_PAYOUT,
            amount: params.transporteurAmount,
          },
        }),
      );
    }

    // HUB PAYOUT
    if (params.hubAmount && params.hubId) {
      writes.push(
        this.prisma.ledgerEntry.create({
          data: {
            payment: { connect: { id: params.paymentId } },
            hub: { connect: { id: params.hubId } },
            type: LedgerEntryType.HUB_PAYOUT,
            amount: params.hubAmount,
          },
        }),
      );
    }

    // INSURANCE PREMIUM
    if (params.insuranceAmount && params.insuranceAmount > 0) {
      writes.push(
        this.prisma.ledgerEntry.create({
          data: {
            payment: { connect: { id: params.paymentId } },
            type: LedgerEntryType.INSURANCE_PREMIUM,
            amount: params.insuranceAmount,
          },
        }),
      );
    }

    await this.prisma.$transaction(writes);
  }

  /* =====================================================
     INSURANCE PAYOUT
  ===================================================== */
  async recordForInsurancePayout(data: {
    paymentId: string;
    amount: number;
  }) {
    return this.prisma.ledgerEntry.create({
      data: {
        payment: { connect: { id: data.paymentId } },
        type: LedgerEntryType.INSURANCE_PAYOUT,
        amount: data.amount,
      },
    });
  }

  /* =====================================================
     REFUND
  ===================================================== */
  async recordRefund(params: {
    paymentId: string;
    amount: number;
  }) {
    return this.prisma.ledgerEntry.create({
      data: {
        payment: { connect: { id: params.paymentId } },
        type: LedgerEntryType.REFUND,
        amount: params.amount,
      },
    });
  }

  /* =====================================================
     EXPORT
  ===================================================== */
  async getLedgerForExport(filters: {
    from?: Date;
    to?: Date;
    type?: LedgerEntryType;
  }) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        ...(filters.type && { type: filters.type }),
        createdAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      },
      include: {
        payment: {
          include: {
            booking: {
              include: {
                client: true,
                trip: true,
              },
            },
          },
        },
        hub: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* =====================================================
     TRANSPORTEUR LEDGER
  ===================================================== */
  async getTransporteurLedger(transporteurId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { transporteurId },
      include: {
        payment: {
          include: {
            booking: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}