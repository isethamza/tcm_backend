import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  PickupSessionStatus,
  VerificationArtifactType,
  PaymentMethod,
  PaymentStatus,
  BookingStatus,
  PickupStatus,
  UserRole,
  ParcelStatus,
} from '@prisma/client';

@Injectable()
export class PickupService {
  private readonly logger = new Logger(PickupService.name);

  constructor(private readonly prisma: PrismaService) {}

  //////////////////////////////////////
  // VALIDATE OPERATOR ACCESS
  //////////////////////////////////////
  private assertOperatorAccess(pickup: any, operatorId: string) {
    if (pickup.booking.trip.transporteurId !== operatorId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private assertBookingAccess(booking: any, operatorId: string) {
    if (booking.trip.transporteurId !== operatorId) {
      throw new ForbiddenException('Access denied');
    }
  }

  //////////////////////////////////////
  // GET PICKUP SESSION
  //////////////////////////////////////
  async getPickup(pickupId: string, operatorId: string) {
    const pickup = await this.prisma.pickupSession.findUnique({
      where: { id: pickupId },
      include: {
        booking: {
          include: {
            trip: true,
            parcels: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                profile: {
                  select: {
                    address: true,
                    city: true,
                    postalCode: true,
                    country: true,
                  },
                },
              },
            },
          },
        },
        artifacts: true,
      },
    });

    if (!pickup) throw new NotFoundException('Pickup not found');

    this.assertOperatorAccess(pickup, operatorId);

    return pickup;
  }

  //////////////////////////////////////
  // START PICKUP
  //////////////////////////////////////
  async startPickup(bookingId: string, operatorId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    this.assertBookingAccess(booking, operatorId);

    if (booking.pickupStatus === PickupStatus.COMPLETED) {
      throw new BadRequestException('Pickup already completed');
    }

    return this.prisma.pickupSession.upsert({
      where: { bookingId },
      update: {
        status: PickupSessionStatus.STARTED,
      },
      create: {
        booking: { connect: { id: bookingId } },
        pickupOption: booking.pickupOption, // ✅ REQUIRED
        status: PickupSessionStatus.STARTED,
      },
    });
  }

  //////////////////////////////////////
  // ADD ARTIFACT (Verification)
  //////////////////////////////////////
  async addArtifact(
    pickupId: string,
    operatorId: string,
    dto: { type: VerificationArtifactType; fileUrl: string },
  ) {
    const pickup = await this.prisma.pickupSession.findUnique({
      where: { id: pickupId },
      include: {
        booking: { include: { trip: true } },
        artifacts: true,
      },
    });

    if (!pickup) throw new NotFoundException('Pickup not found');

    this.assertOperatorAccess(pickup, operatorId);

    if (pickup.status === PickupSessionStatus.COMPLETED) {
      throw new BadRequestException('Pickup already completed');
    }

    const exists = pickup.artifacts.some(a => a.type === dto.type);

    if (exists) {
      throw new BadRequestException(
        `Artifact ${dto.type} already uploaded`,
      );
    }

    return this.prisma.verificationArtifact.create({
      data: {
        pickup: { connect: { id: pickupId } },
        type: dto.type,
        fileUrl: dto.fileUrl,
      },
    });
  }

  //////////////////////////////////////
  // CONFIRM PARCELS
  //////////////////////////////////////
  async confirmParcels(
    pickupId: string,
    operatorId: string,
    parcels: {
      parcelId: string;
      status?: 'VERIFIED' | 'MISSING' | 'DAMAGED';
      failureReason?: string;
    }[],
  ) {
    if (!parcels?.length) {
      throw new BadRequestException('No parcels provided');
    }

    const pickup = await this.prisma.pickupSession.findUnique({
      where: { id: pickupId },
      include: {
        booking: {
          include: { trip: true, parcels: true },
        },
      },
    });

    if (!pickup) throw new NotFoundException('Pickup not found');

    this.assertOperatorAccess(pickup, operatorId);

    if (pickup.status === PickupSessionStatus.COMPLETED) {
      throw new BadRequestException('Pickup already completed');
    }

    const validParcelIds = new Set(
      pickup.booking.parcels.map(p => p.id),
    );

    await this.prisma.$transaction(async tx => {
      for (const p of parcels) {
        if (!validParcelIds.has(p.parcelId)) {
          throw new BadRequestException(
            `Parcel ${p.parcelId} not part of booking`,
          );
        }

        /* ===============================
           ISSUES
        =============================== */
        if (p.status === 'MISSING' || p.status === 'DAMAGED') {
          await tx.parcel.update({
            where: { id: p.parcelId },
            data: { status: p.status as ParcelStatus },
          });

          await tx.bookingIssue.create({
            data: {
              booking: { connect: { id: pickup.bookingId } },
              parcel: { connect: { id: p.parcelId } },
              type: p.status,
              note: p.failureReason,
            },
          });
        }

        /* ===============================
           VERIFIED
        =============================== */
        if (!p.status || p.status === 'VERIFIED') {
          await tx.parcel.update({
            where: { id: p.parcelId },
            data: {
              status: ParcelStatus.PICKED_UP,
              verifiedAt: new Date(),
            },
          });
        }
      }
    });

    return { success: true };
  }

  //////////////////////////////////////
  // COMPLETE PICKUP
  //////////////////////////////////////
  async completePickup(
    pickupId: string,
    operatorId: string,
    dto: { cashCollected?: number },
  ) {
    return this.prisma.$transaction(async tx => {
      const pickup = await tx.pickupSession.findUnique({
        where: { id: pickupId },
        include: {
          booking: { include: { trip: true, parcels: true } },
          artifacts: true,
        },
      });

      if (!pickup) throw new NotFoundException('Pickup not found');

      this.assertOperatorAccess(pickup, operatorId);

      if (pickup.status === PickupSessionStatus.COMPLETED) {
        return { success: true, paymentId: null };
      }

      const booking = pickup.booking;

      /* ===============================
         VALIDATE ARTIFACTS
      =============================== */

      const uploaded = pickup.artifacts.map(a => a.type);

      if (!uploaded.includes(VerificationArtifactType.IDENTITY)) {
        throw new BadRequestException('Missing ID verification');
      }

      const hasPicked = booking.parcels.some(
        p => p.status === ParcelStatus.PICKED_UP,
      );

      if (
        hasPicked &&
        !uploaded.includes(VerificationArtifactType.PARCEL)
      ) {
        throw new BadRequestException('Parcel photo required');
      }

      let paymentId: string | null = null;

      /* ===============================
         CASH PAYMENT
      =============================== */

      if (dto.cashCollected && dto.cashCollected > 0) {
        const remaining = Number(booking.remainingAmount);

        if (dto.cashCollected > remaining) {
          throw new BadRequestException('Cash exceeds remaining');
        }

        const payment = await tx.payment.create({
          data: {
            booking: { connect: { id: booking.id } },
            User: { connect: { id: operatorId } },
            amount: dto.cashCollected,
            method: PaymentMethod.CASH,
            status: PaymentStatus.COMPLETED,
            collectedBy: UserRole.TRANSPORTEUR,
          },
        });

        paymentId = payment.id;

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            remainingAmount: Math.max(
              0,
              remaining - dto.cashCollected,
            ),
          },
        });
      }

      /* ===============================
         COMPLETE PICKUP
      =============================== */

      await tx.pickupSession.update({
        where: { id: pickupId },
        data: {
          status: PickupSessionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          pickupStatus: PickupStatus.COMPLETED,
          status: BookingStatus.PICKED_UP,
        },
      });

      /* ===============================
         TRACKING
      =============================== */

      await Promise.all(
        booking.parcels.map(parcel =>
          tx.trackingEvent.create({
            data: {
              booking: { connect: { id: booking.id } },
              parcel: { connect: { id: parcel.id } },
              trip: { connect: { id: booking.tripId } },
              status: BookingStatus.PICKED_UP,
              eventType: 'PUBLIC',
              message: 'Pickup completed',
              location: booking.trip.departureCity,
            },
          }),
        ),
      );

      return {
        success: true,
        paymentId,
      };
    });
  }
}