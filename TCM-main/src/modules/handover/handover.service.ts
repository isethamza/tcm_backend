import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  BookingStatus,
  ParcelStatus,
  UserRole,
  HandoverBatchStatus,
  Prisma,
  TrackingStatus,
} from '@prisma/client';

interface CreateHandoverInput {
  batchId?: string;
  parcelId?: string;
  toType: UserRole;
  toUserId?: string;
  toHubId?: string;
  declaredStatus?: ParcelStatus;
  notes?: string;
  photos?: string[];
}

@Injectable()
export class HandoverService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     CREATE HANDOVER
  ===================================================== */
  async create(dto: CreateHandoverInput, operatorId: string) {
    this.validateScope(dto);
    this.validateTarget(dto);

    if (dto.batchId) {
      return this.createBatchHandover(dto, operatorId);
    }

    if (dto.parcelId) {
      return this.createParcelHandover(dto, operatorId);
    }

    throw new BadRequestException('Invalid handover scope');
  }

  /* =====================================================
     BATCH HANDOVER
  ===================================================== */
  private async createBatchHandover(
    dto: CreateHandoverInput,
    operatorId: string,
  ) {
    const batch = await this.prisma.handoverBatch.findUnique({
      where: { id: dto.batchId },
      include: {
        parcels: true,
      },
    });

    if (!batch) throw new NotFoundException('Batch not found');

    if (batch.transporteurId !== operatorId) {
      throw new ForbiddenException();
    }

    if (batch.status !== HandoverBatchStatus.CREATED) {
      throw new BadRequestException('Batch already processed');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.handoverEvent.create({
        data: {
          batchId: batch.id,
          fromType: UserRole.TRANSPORTEUR,
          fromUserId: operatorId,
          toType: dto.toType,
          toUserId: dto.toUserId ?? null,
          toHubId: dto.toHubId ?? null,
          declaredStatus: dto.declaredStatus ?? null,
          notes: dto.notes,
          photos: dto.photos ?? [],
          handedById: operatorId,
        },
      });

      await tx.handoverBatch.update({
        where: { id: batch.id },
        data: {
          status: HandoverBatchStatus.IN_PROGRESS,
        },
      });

      return event;
    });
  }

  /* =====================================================
     PARCEL HANDOVER
  ===================================================== */
  private async createParcelHandover(
    dto: CreateHandoverInput,
    operatorId: string,
  ) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: dto.parcelId },
      include: {
        booking: {
          include: { trip: true },
        },
      },
    });

    if (!parcel) throw new NotFoundException('Parcel not found');

    if (!parcel.booking?.trip) {
      throw new BadRequestException('Invalid parcel booking/trip');
    }

    if (
      parcel.booking.trip.transporteurId !== operatorId
    ) {
      throw new ForbiddenException();
    }

    return this.prisma.handoverEvent.create({
      data: {
        parcelId: parcel.id,
        bookingId: parcel.bookingId,
        fromType: UserRole.TRANSPORTEUR,
        fromUserId: operatorId,
        toType: dto.toType,
        toUserId: dto.toUserId ?? null,
        declaredStatus: dto.declaredStatus ?? null,
        notes: dto.notes,
        photos: dto.photos ?? [],
        handedById: operatorId,
      },
    });
  }

  /* =====================================================
     ACCEPT / REJECT
  ===================================================== */
  async accept(
    handoverId: string,
    operatorId: string,
    accept: boolean,
  ) {
    const handover = await this.prisma.handoverEvent.findUnique({
      where: { id: handoverId },
      include: {
        batch: {
          include: { parcels: true },
        },
      },
    });

    if (!handover) throw new NotFoundException();

    if (handover.toUserId && handover.toUserId !== operatorId) {
      throw new ForbiddenException();
    }

    if (handover.isAccepted) {
      return { success: true }; // idempotent
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (!accept) {
        await tx.bookingIssue.create({
          data: {
            bookingId: handover.bookingId ?? undefined,
            parcelId: handover.parcelId ?? undefined,
            type: 'HANDOVER_REJECTED',
            note: 'Receiver rejected handover',
          },
        });

        return { success: false };
      }

      await tx.handoverEvent.update({
        where: { id: handoverId },
        data: {
          isAccepted: true,
          acceptedAt: new Date(),
          acceptedById: operatorId,
        },
      });

      /* ===============================
         BATCH
      =============================== */
      if (handover.batchId) {
        const parcelIds =
          handover.batch?.parcels.map(p => p.parcelId) ?? [];

        if (parcelIds.length) {
          await tx.parcel.updateMany({
            where: { id: { in: parcelIds } },
            data: {
              status:
                handover.declaredStatus ??
                ParcelStatus.PICKED_UP,
            },
          });
        }

        await tx.handoverBatch.update({
          where: { id: handover.batchId },
          data: {
            status: HandoverBatchStatus.COMPLETED,
          },
        });
      }

      /* ===============================
         PARCEL
      =============================== */
      if (handover.parcelId) {
        await tx.parcel.update({
          where: { id: handover.parcelId },
          data: {
            status:
              handover.declaredStatus ??
                ParcelStatus.PICKED_UP,
          },
        });
      }

      /* ===============================
         BOOKING (SMART UPDATE)
      =============================== */
      if (handover.bookingId) {
        await tx.booking.update({
          where: { id: handover.bookingId },
          data: {
            status:
              handover.parcelId &&
              handover.declaredStatus === ParcelStatus.PICKED_UP
                ? BookingStatus.COMPLETED
                : BookingStatus.IN_TRANSIT,
          },
        });
      }

      return { success: true };
    });
  }

  /* =====================================================
     GET HANDOVERS
  ===================================================== */
  async getByBooking(bookingId: string) {
    return this.prisma.handoverEvent.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /* =====================================================
     VALIDATION
  ===================================================== */
  private validateScope(dto: CreateHandoverInput) {
    const count = [dto.batchId, dto.parcelId].filter(Boolean).length;

    if (count !== 1) {
      throw new BadRequestException(
        'Provide either batchId OR parcelId',
      );
    }
  }

  private validateTarget(dto: CreateHandoverInput) {
    if (!dto.toType) {
      throw new BadRequestException('Missing toType');
    }

    if (
      dto.toType === UserRole.HUB_MANAGER &&
      !dto.toHubId
    ) {
      throw new BadRequestException('Missing toHubId');
    }

    if (
      dto.toType === UserRole.RECIPIENT &&
      !dto.toUserId
    ) {
      throw new BadRequestException('Missing recipient');
    }
  }
}