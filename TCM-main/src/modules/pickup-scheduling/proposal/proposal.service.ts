import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { proposalQueue } from './proposal.queue';
import { PickupRoutingQueue } from '../../pickup-routing/pickup-routing.queue';

import {
  PickupStatus,
  SlotProposalStatus,
  PickupOption,
} from '@prisma/client';

import {
  JOBS,
  getJobOptions,
  buildJobId,
} from '../../../infra/queue/queue.constants';

import { JobsOptions } from 'bullmq'; // ✅ IMPORTANT

const MAX_REJECTIONS = 2;
const PROPOSAL_EXPIRY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ProposalService {
  private readonly logger = new Logger(ProposalService.name);

  constructor(private prisma: PrismaService) {}

  //////////////////////////////////////
  // 🟣 CREATE PROPOSAL
  //////////////////////////////////////
  async createProposal(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.pickupOption !== PickupOption.ADVANCED_HOME_PICKUP) {
      throw new BadRequestException(
        'Proposal allowed only for ADVANCED_HOME_PICKUP',
      );
    }

    if (!booking.pickupStart || !booking.pickupEnd) {
      throw new BadRequestException('Booking not routed yet');
    }

    const existing = await this.prisma.schedulingProposal.findFirst({
      where: {
        bookingId,
        status: SlotProposalStatus.PENDING,
      },
    });

    if (existing) {
      this.logger.warn(`⚠️ Proposal already exists → ${existing.id}`);
      return existing;
    }

    const proposal = await this.prisma.schedulingProposal.create({
      data: {
        bookingId,
        startTime: booking.pickupStart,
        endTime: booking.pickupEnd,
        status: SlotProposalStatus.PENDING,
        expiresAt: new Date(Date.now() + PROPOSAL_EXPIRY_MS),
      },
    });

    this.logger.log(`📦 Proposal created → ${proposal.id}`);

    //////////////////////////////////////
    // ⏳ SCHEDULE EXPIRATION
    //////////////////////////////////////
    const jobOptions: JobsOptions = {
      ...(getJobOptions(
        buildJobId(['proposal-expire', proposal.id]),
      ) as JobsOptions),
      delay: PROPOSAL_EXPIRY_MS, // ✅ now valid
    };

    await proposalQueue.add(
      JOBS.PROPOSAL.EXPIRE,
      { proposalId: proposal.id },
      jobOptions,
    );

    //////////////////////////////////////
    // UPDATE BOOKING
    //////////////////////////////////////
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        pickupStatus: PickupStatus.PROPOSED,
      },
    });

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

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

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

    //////////////////////////////////////
    // 🚀 TRIGGER ROUTING
    //////////////////////////////////////
    await PickupRoutingQueue.add(
      JOBS.PICKUP_ROUTING.RECOMPUTE,
      { tripId: proposal.booking.tripId },
      getJobOptions(
        buildJobId(['pickup-route', proposal.booking.tripId]),
      ) as JobsOptions, // ✅ ensure correct typing
    );

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

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.status !== SlotProposalStatus.PENDING) {
      return { success: true };
    }

    const totalRejected = await this.prisma.schedulingProposal.count({
      where: {
        bookingId: proposal.bookingId,
        status: SlotProposalStatus.REJECTED,
      },
    });

    const nextCount = totalRejected + 1;

    await this.prisma.$transaction([
      this.prisma.schedulingProposal.update({
        where: { id: proposalId },
        data: {
          status: SlotProposalStatus.REJECTED,
          rejectedCount: proposal.rejectedCount + 1,
        },
      }),

      this.prisma.booking.update({
        where: { id: proposal.bookingId },
        data: {
          pickupLocked: nextCount >= MAX_REJECTIONS,
          pickupStatus: PickupStatus.NOT_SCHEDULED,
        },
      }),
    ]);

    this.logger.warn(
      `❌ Proposal rejected → ${proposalId} (count=${nextCount})`,
    );

    if (nextCount >= MAX_REJECTIONS) {
      return { status: 'LOCKED_AFTER_MAX_REJECTIONS' };
    }

    //////////////////////////////////////
    // 🔁 REROUTE
    //////////////////////////////////////
    await PickupRoutingQueue.add(
      JOBS.PICKUP_ROUTING.RECOMPUTE,
      { tripId: proposal.booking.tripId },
      getJobOptions(
        buildJobId(['pickup-route', proposal.booking.tripId]),
      ) as JobsOptions,
    );

    return {
      status: 'REJECTED_AND_REROUTED',
      remainingAttempts: MAX_REJECTIONS - nextCount,
    };
  }

  //////////////////////////////////////
  // ⏳ EXPIRE PROPOSAL
  //////////////////////////////////////
  async expireProposal(proposalId: string) {
    const proposal = await this.prisma.schedulingProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) return;
    if (proposal.status !== SlotProposalStatus.PENDING) return;

    await this.prisma.$transaction([
      this.prisma.schedulingProposal.update({
        where: { id: proposalId },
        data: { status: SlotProposalStatus.EXPIRED },
      }),

      this.prisma.booking.update({
        where: { id: proposal.bookingId },
        data: {
          pickupLocked: false,
          pickupStatus: PickupStatus.NOT_SCHEDULED,
        },
      }),
    ]);

    this.logger.log(`⏳ Proposal expired → ${proposalId}`);
  }
}