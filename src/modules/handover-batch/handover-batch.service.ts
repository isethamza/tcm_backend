import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  DeliveryOption,
  ParcelStatus,
  HandoverBatchStatus,
  HandoverDestinationType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class HandoverBatchService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     AUTO GROUP & ASSIGN
  ===================================================== */
  async autoGroupAndAssign(
    transporteurId: string,
    parcelIds: string[],
  ) {
    if (!parcelIds?.length) {
      throw new BadRequestException('No parcelIds provided');
    }

    const parcels = await this.prisma.parcel.findMany({
      where: { id: { in: parcelIds } },
      include: {
        booking: { include: { trip: true } },
      },
    });

    if (!parcels.length) {
      throw new BadRequestException('No parcels found');
    }

    this.validateParcelsOwnership(parcels, transporteurId);
    this.validateParcelsEligibility(parcels);

    const groups = this.groupParcels(parcels);

    const results: { batchId: string; count: number }[] = [];

    await this.prisma.$transaction(async tx => {
      for (const [key, parcelGroupIds] of groups.entries()) {
        const destination = this.parseKey(key);

        const batch = await this.findOrCreateBatchTx(
          tx,
          transporteurId,
          destination,
        );

        await this.assignParcelsToBatchTx(
          tx,
          batch.id,
          parcelGroupIds,
        );

        results.push({
          batchId: batch.id,
          count: parcelGroupIds.length,
        });
      }
    });

    return results;
  }

  /* =====================================================
     CREATE BATCH (MANUAL)
  ===================================================== */
  async createBatch(
    transporteurId: string,
    destination: {
      type: HandoverDestinationType;
      value: string;
    },
  ) {
    return this.prisma.handoverBatch.create({
      data: {
        transporteurId,
        destinationType: destination.type,
        destinationCity:
          destination.type === 'CITY' ? destination.value : null,
        hubId:
          destination.type === 'HUB' ? destination.value : null,
        tripStopId:
          destination.type === 'TRIP_STOP'
            ? destination.value
            : null,
        status: HandoverBatchStatus.CREATED,
      },
    });
  }

  /* =====================================================
     ADD PARCELS (STRICT)
  ===================================================== */
  async addParcels(
    transporteurId: string,
    batchId: string,
    parcelIds: string[],
  ) {
    if (!parcelIds?.length) {
      throw new BadRequestException('No parcelIds provided');
    }

    return this.prisma.$transaction(async tx => {
      const batch = await tx.handoverBatch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new BadRequestException('Batch not found');
      }

      if (batch.transporteurId !== transporteurId) {
        throw new ForbiddenException('Not your batch');
      }

      if (batch.status !== HandoverBatchStatus.CREATED) {
        throw new BadRequestException(
          'Cannot modify this batch',
        );
      }

      const parcels = await tx.parcel.findMany({
        where: { id: { in: parcelIds } },
        include: {
          booking: { include: { trip: true } },
        },
      });

      if (parcels.length !== parcelIds.length) {
        throw new BadRequestException('Some parcels not found');
      }

      this.validateParcelsOwnership(parcels, transporteurId);
      this.validateParcelsEligibility(parcels);

      // Ensure destination consistency
      for (const parcel of parcels) {
        const key = this.getBatchKey(parcel.booking);
        const parsed = this.parseKey(key);

        if (parsed.type !== batch.destinationType) {
          throw new BadRequestException(
            `Parcel ${parcel.id} destination mismatch`,
          );
        }

        if (
          parsed.type === 'CITY' &&
          parsed.value !== batch.destinationCity
        ) {
          throw new BadRequestException(
            `Parcel ${parcel.id} city mismatch`,
          );
        }

        if (
          parsed.type === 'HUB' &&
          parsed.value !== batch.hubId
        ) {
          throw new BadRequestException(
            `Parcel ${parcel.id} hub mismatch`,
          );
        }

        if (
          parsed.type === 'TRIP_STOP' &&
          parsed.value !== batch.tripStopId
        ) {
          throw new BadRequestException(
            `Parcel ${parcel.id} stop mismatch`,
          );
        }
      }

      await this.assignParcelsToBatchTx(
        tx,
        batchId,
        parcelIds,
      );

      return { batchId, added: parcelIds.length };
    });
  }

  /* =====================================================
     GET BATCH
  ===================================================== */
  async getBatchById(
    transporteurId: string,
    batchId: string,
  ) {
    const batch = await this.prisma.handoverBatch.findUnique({
      where: { id: batchId },
      include: {
        parcels: {
          include: {
            parcel: {
              include: {
                booking: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    if (batch.transporteurId !== transporteurId) {
      throw new ForbiddenException('Access denied');
    }

    return batch;
  }

  /* =====================================================
     LIST BATCHES
  ===================================================== */
  async listBatches(
    transporteurId: string,
    filters?: {
      status?: HandoverBatchStatus;
    },
  ) {
    return this.prisma.handoverBatch.findMany({
      where: {
        transporteurId,
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { parcels: true } },
      },
    });
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  private validateParcelsOwnership(
    parcels: any[],
    transporteurId: string,
  ) {
    for (const parcel of parcels) {
      if (
        parcel.booking?.trip?.transporteurId !==
        transporteurId
      ) {
        throw new ForbiddenException(
          `Parcel ${parcel.id} not owned`,
        );
      }
    }
  }

  private validateParcelsEligibility(parcels: any[]) {
    for (const parcel of parcels) {
      if (parcel.status !== ParcelStatus.PICKED_UP) {
        throw new BadRequestException(
          `Parcel ${parcel.id} not eligible`,
        );
      }
    }
  }

  private groupParcels(parcels: any[]) {
    const groups = new Map<string, string[]>();

    for (const parcel of parcels) {
      const key = this.getBatchKey(parcel.booking);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(parcel.id);
    }

    return groups;
  }

  private getBatchKey(booking: {
    deliveryOption: DeliveryOption;
    destinationCity?: string | null;
    destinationHubId?: string | null;
    deliveryTripStopId?: string | null;
  }): string {
    switch (booking.deliveryOption) {
      case DeliveryOption.HOME_DELIVERY:
        if (!booking.destinationCity) {
          throw new BadRequestException(
            'Missing destinationCity',
          );
        }
        return `CITY:${booking.destinationCity
          .trim()
          .toLowerCase()}`;

      case DeliveryOption.HUB_PICKUP:
        if (!booking.destinationHubId) {
          throw new BadRequestException('Missing hub');
        }
        return `HUB:${booking.destinationHubId}`;

      case DeliveryOption.POPUP_PICKUP:
        if (!booking.deliveryTripStopId) {
          throw new BadRequestException('Missing tripStop');
        }
        return `TRIP_STOP:${booking.deliveryTripStopId}`;

      default:
        throw new BadRequestException(
          'Invalid deliveryOption',
        );
    }
  }

  private parseKey(key: string): {
    type: HandoverDestinationType;
    value: string;
  } {
    const [type, value] = key.split(':');

    return {
      type: type as HandoverDestinationType,
      value,
    };
  }

  private async findOrCreateBatchTx(
    tx: Prisma.TransactionClient,
    transporteurId: string,
    destination: {
      type: HandoverDestinationType;
      value: string;
    },
  ) {
    const where: Prisma.HandoverBatchWhereInput = {
      transporteurId,
      status: HandoverBatchStatus.CREATED,
      ...(destination.type === 'CITY' && {
        destinationCity: destination.value,
      }),
      ...(destination.type === 'HUB' && {
        hubId: destination.value,
      }),
      ...(destination.type === 'TRIP_STOP' && {
        tripStopId: destination.value,
      }),
    };

    let batch = await tx.handoverBatch.findFirst({ where });

    if (!batch) {
      batch = await tx.handoverBatch.create({
        data: {
          transporteurId,
          destinationType: destination.type,
          destinationCity:
            destination.type === 'CITY'
              ? destination.value
              : null,
          hubId:
            destination.type === 'HUB'
              ? destination.value
              : null,
          tripStopId:
            destination.type === 'TRIP_STOP'
              ? destination.value
              : null,
          status: HandoverBatchStatus.CREATED,
        },
      });
    }

    return batch;
  }

  private async assignParcelsToBatchTx(
    tx: Prisma.TransactionClient,
    batchId: string,
    parcelIds: string[],
  ) {
    const existing = await tx.handoverBatchParcel.findMany({
      where: {
        parcelId: { in: parcelIds },
        batch: {
          status: {
            in: [
              HandoverBatchStatus.CREATED,
              HandoverBatchStatus.IN_PROGRESS,
            ],
          },
        },
      },
      select: { parcelId: true },
    });

    if (existing.length) {
      throw new BadRequestException(
        `Parcels already in active batch: ${existing
          .map(e => e.parcelId)
          .join(', ')}`,
      );
    }

    await tx.handoverBatchParcel.createMany({
      data: parcelIds.map(parcelId => ({
        batchId,
        parcelId,
      })),
      skipDuplicates: true,
    });
  }
}