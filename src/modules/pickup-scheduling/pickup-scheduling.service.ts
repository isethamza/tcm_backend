import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { proposalQueue } from './proposal/proposal.queue';

import { PickupRoutingService } from '../../modules/pickup-routing/pickup-routing.service';
import { AuditService } from '../../modules/audit/audit.service';
import { BookingMailService } from '../../modules/bookings/booking-mail.service';

import {
  PickupStatus,
  SlotProposalStatus,
  PickupOption,
  AuditAction,
} from '@prisma/client';

@Injectable()
export class PickupSchedulingService {
  private readonly logger = new Logger(PickupSchedulingService.name);

  constructor(
    private prisma: PrismaService,
    private routing: PickupRoutingService,
    private audit: AuditService,
    private mail: BookingMailService,
  ) {}

  //////////////////////////////////////
  // 🚀 ACTIVATION (AFTER PAYMENT)
  //////////////////////////////////////
  async onBookingActivated(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { originHub: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    //////////////////////////////////////
    // 📍 GEO SNAPSHOT (IDEMPOTENT)
    //////////////////////////////////////
    if (booking.pickupLat == null) {
      let lat: number;
      let lng: number;

      if (
        booking.pickupOption === PickupOption.SELF_DROPOFF_AT_HUB &&
        booking.originHub
      ) {
        lat = booking.originHub.lat;
        lng = booking.originHub.lng;
      } else {
        const profile = await this.prisma.profile.findUnique({
          where: { userId: booking.clientId },
        });

        if (!profile?.lat || !profile?.lng) {
          throw new BadRequestException('Missing profile location');
        }

        lat = profile.lat;
        lng = profile.lng;
      }

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          pickupLat: lat,
          pickupLng: lng,
          pickupStatus: PickupStatus.NOT_SCHEDULED,
        },
      });

      await this.audit.log({
        actorId: booking.clientId,
        action: AuditAction.BOOKING_ACTIVATED,
        entity: 'booking',
        entityId: booking.id,
        metadata: { lat, lng },
      });
    }

    //////////////////////////////////////
    // 📧 EMAIL (SEND ON FIRST VALID PAYMENT)
    //////////////////////////////////////
    const updated = await this.prisma.booking.updateMany({
      where: { id: bookingId, emailSentAt: null },
      data: { emailSentAt: new Date() },
    });

    if (updated.count === 1) {
      await this.mail.sendBookingPdfEmail(
        booking.id,
        booking.clientId,
        'en',
      );

      await this.audit.log({
        actorId: booking.clientId,
        action: AuditAction.BOOKING_EMAIL_CONFIRMATION_SENT,
        entity: 'booking',
        entityId: booking.id,
      });
    }

    //////////////////////////////////////
    // 🚀 TRIGGER ROUTING (TRIP LEVEL)
    //////////////////////////////////////
    await this.routing.enqueueTripRouting(booking.tripId);

    await this.audit.log({
      actorId: 'system',
      action: AuditAction.PICKUP_ROUTING_TRIGGERED,
      entity: 'trip',
      entityId: booking.tripId,
      metadata: { bookingId },
    });

    this.logger.log(`🚀 Booking activated → ${bookingId}`);
  }

  //////////////////////////////////////
  // 🔒 LOCK PICKUP (FINAL SLOT)
  //////////////////////////////////////
  async lockPickup(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.pickupLocked) return booking;

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        pickupLocked: true,
        pickupLockedAt: new Date(),
        pickupStatus: PickupStatus.SCHEDULED,
      },
    });

    await this.audit.log({
      actorId: 'system',
      action: AuditAction.PICKUP_ROUTING_LOCKED,
      entity: 'booking',
      entityId: bookingId,
    });

    return updated;
  }

  //////////////////////////////////////
  // 🟣 CREATE PROPOSAL (ADVANCED)
  //////////////////////////////////////
async createProposal(bookingId: string) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new NotFoundException('Booking not found');

  if (booking.pickupOption !== PickupOption.ADVANCED_HOME_PICKUP) {
    throw new BadRequestException(
      'Proposal allowed only for ADVANCED_HOME_PICKUP',
    );
  }

  if (!booking.pickupStart || !booking.pickupEnd) {
    throw new BadRequestException('Booking not routed yet');
  }

  if (booking.pickupLocked) {
    throw new BadRequestException('Pickup already locked');
  }

  //////////////////////////////////////
  // PREVENT DUPLICATE
  //////////////////////////////////////
  const existing = await this.prisma.schedulingProposal.findFirst({
    where: {
      bookingId,
      status: SlotProposalStatus.PENDING,
    },
  });

  if (existing) return existing;

  //////////////////////////////////////
  // CREATE
  //////////////////////////////////////
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const proposal = await this.prisma.schedulingProposal.create({
    data: {
      bookingId,
      startTime: booking.pickupStart,
      endTime: booking.pickupEnd,
      status: SlotProposalStatus.PENDING,
      expiresAt,
    },
  });

  //////////////////////////////////////
  // UPDATE STATUS
  //////////////////////////////////////
  await this.prisma.booking.update({
    where: { id: bookingId },
    data: { pickupStatus: PickupStatus.PROPOSED },
  });

  //////////////////////////////////////
  // 📧 EMAIL CLIENT
  //////////////////////////////////////
  await this.mail.sendPickupProposalEmail({
    to: booking.clientId, // ⚠️ ideally booking.email
    slotStart: proposal.startTime,
    slotEnd: proposal.endTime,
    tripId: booking.tripId,
  });

  //////////////////////////////////////
  // QUEUE EXPIRATION
  //////////////////////////////////////
  await proposalQueue.add('expire-proposal', {
    proposalId: proposal.id,
  });

  this.logger.log(`📦 Proposal created → ${proposal.id}`);

  return proposal;
}
  //////////////////////////////////////
  // ✅ ACCEPT PROPOSAL
  //////////////////////////////////////
  async acceptProposal(proposalId: string) {
    const proposal = await this.prisma.schedulingProposal.findUnique({
      where: { id: proposalId },
      include: { booking: true },
    });

    if (!proposal) throw new NotFoundException();

    if (proposal.status !== SlotProposalStatus.PENDING) {
      return { success: true };
    }

    await this.prisma.$transaction([
      this.prisma.schedulingProposal.update({
        where: { id: proposalId },
        data: { status: SlotProposalStatus.ACCEPTED },
      }),
      this.prisma.booking.update({
        where: { id: proposal.bookingId },
        data: {
          pickupStart: proposal.startTime,
          pickupEnd: proposal.endTime,
          pickupLocked: true,
          pickupLockedAt: new Date(),
          pickupStatus: PickupStatus.SCHEDULED,
        },
      }),
    ]);

    this.logger.log(`✅ Proposal accepted → ${proposalId}`);

    return { success: true };
  }

  //////////////////////////////////////
  // ❌ REJECT PROPOSAL
  //////////////////////////////////////
  async rejectProposal(proposalId: string) {
    const proposal = await this.prisma.schedulingProposal.findUnique({
      where: { id: proposalId },
      include: { booking: true },
    });

    if (!proposal) throw new NotFoundException();

    if (proposal.status !== SlotProposalStatus.PENDING) {
      return { success: true };
    }

    const rejectedCount =
      await this.prisma.schedulingProposal.count({
        where: {
          bookingId: proposal.bookingId,
          status: SlotProposalStatus.REJECTED,
        },
      });

    const next = rejectedCount + 1;

    await this.prisma.$transaction([
      this.prisma.schedulingProposal.update({
        where: { id: proposalId },
        data: { status: SlotProposalStatus.REJECTED },
      }),
      this.prisma.booking.update({
        where: { id: proposal.bookingId },
        data: {
          pickupLocked: next >= 2,
          pickupStatus: PickupStatus.NOT_SCHEDULED,
        },
      }),
    ]);

    this.logger.warn(
      `❌ Proposal rejected → ${proposalId} (count=${next})`,
    );

    if (next < 2) {
      await this.routing.enqueueTripRouting(
        proposal.booking.tripId,
      );
    }

    return {
      status:
        next >= 2
          ? 'LOCKED_AFTER_MAX_REJECTIONS'
          : 'REJECTED_AND_REROUTED',
    };
  }
}