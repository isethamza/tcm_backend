"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProposalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const proposal_queue_1 = require("./proposal.queue");
const pickup_routing_queue_1 = require("../../pickup-routing/pickup-routing.queue");
const client_1 = require("@prisma/client");
const queue_constants_1 = require("../../../infra/queue/queue.constants");
const MAX_REJECTIONS = 2;
const PROPOSAL_EXPIRY_MS = 24 * 60 * 60 * 1000;
let ProposalService = ProposalService_1 = class ProposalService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProposalService_1.name);
    }
    async createProposal(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.pickupOption !== client_1.PickupOption.ADVANCED_HOME_PICKUP) {
            throw new common_1.BadRequestException('Proposal allowed only for ADVANCED_HOME_PICKUP');
        }
        if (!booking.pickupStart || !booking.pickupEnd) {
            throw new common_1.BadRequestException('Booking not routed yet');
        }
        const existing = await this.prisma.schedulingProposal.findFirst({
            where: {
                bookingId,
                status: client_1.SlotProposalStatus.PENDING,
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
                status: client_1.SlotProposalStatus.PENDING,
                expiresAt: new Date(Date.now() + PROPOSAL_EXPIRY_MS),
            },
        });
        this.logger.log(`📦 Proposal created → ${proposal.id}`);
        const jobOptions = {
            ...(0, queue_constants_1.getJobOptions)((0, queue_constants_1.buildJobId)(['proposal-expire', proposal.id])),
            delay: PROPOSAL_EXPIRY_MS,
        };
        await proposal_queue_1.proposalQueue.add(queue_constants_1.JOBS.PROPOSAL.EXPIRE, { proposalId: proposal.id }, jobOptions);
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                pickupStatus: client_1.PickupStatus.PROPOSED,
            },
        });
        return proposal;
    }
    async acceptProposal(proposalId) {
        const proposal = await this.prisma.schedulingProposal.findUnique({
            where: { id: proposalId },
            include: { booking: true },
        });
        if (!proposal) {
            throw new common_1.NotFoundException('Proposal not found');
        }
        if (proposal.status !== client_1.SlotProposalStatus.PENDING) {
            return { success: true };
        }
        await this.prisma.$transaction([
            this.prisma.schedulingProposal.update({
                where: { id: proposalId },
                data: { status: client_1.SlotProposalStatus.ACCEPTED },
            }),
            this.prisma.booking.update({
                where: { id: proposal.bookingId },
                data: {
                    pickupStart: proposal.startTime,
                    pickupEnd: proposal.endTime,
                    pickupLocked: true,
                    pickupLockedAt: new Date(),
                    pickupStatus: client_1.PickupStatus.SCHEDULED,
                },
            }),
        ]);
        this.logger.log(`✅ Proposal accepted → ${proposalId}`);
        await pickup_routing_queue_1.PickupRoutingQueue.add(queue_constants_1.JOBS.PICKUP_ROUTING.RECOMPUTE, { tripId: proposal.booking.tripId }, (0, queue_constants_1.getJobOptions)((0, queue_constants_1.buildJobId)(['pickup-route', proposal.booking.tripId])));
        return { success: true };
    }
    async rejectProposal(proposalId) {
        const proposal = await this.prisma.schedulingProposal.findUnique({
            where: { id: proposalId },
            include: { booking: true },
        });
        if (!proposal) {
            throw new common_1.NotFoundException('Proposal not found');
        }
        if (proposal.status !== client_1.SlotProposalStatus.PENDING) {
            return { success: true };
        }
        const totalRejected = await this.prisma.schedulingProposal.count({
            where: {
                bookingId: proposal.bookingId,
                status: client_1.SlotProposalStatus.REJECTED,
            },
        });
        const nextCount = totalRejected + 1;
        await this.prisma.$transaction([
            this.prisma.schedulingProposal.update({
                where: { id: proposalId },
                data: {
                    status: client_1.SlotProposalStatus.REJECTED,
                    rejectedCount: proposal.rejectedCount + 1,
                },
            }),
            this.prisma.booking.update({
                where: { id: proposal.bookingId },
                data: {
                    pickupLocked: nextCount >= MAX_REJECTIONS,
                    pickupStatus: client_1.PickupStatus.NOT_SCHEDULED,
                },
            }),
        ]);
        this.logger.warn(`❌ Proposal rejected → ${proposalId} (count=${nextCount})`);
        if (nextCount >= MAX_REJECTIONS) {
            return { status: 'LOCKED_AFTER_MAX_REJECTIONS' };
        }
        await pickup_routing_queue_1.PickupRoutingQueue.add(queue_constants_1.JOBS.PICKUP_ROUTING.RECOMPUTE, { tripId: proposal.booking.tripId }, (0, queue_constants_1.getJobOptions)((0, queue_constants_1.buildJobId)(['pickup-route', proposal.booking.tripId])));
        return {
            status: 'REJECTED_AND_REROUTED',
            remainingAttempts: MAX_REJECTIONS - nextCount,
        };
    }
    async expireProposal(proposalId) {
        const proposal = await this.prisma.schedulingProposal.findUnique({
            where: { id: proposalId },
        });
        if (!proposal)
            return;
        if (proposal.status !== client_1.SlotProposalStatus.PENDING)
            return;
        await this.prisma.$transaction([
            this.prisma.schedulingProposal.update({
                where: { id: proposalId },
                data: { status: client_1.SlotProposalStatus.EXPIRED },
            }),
            this.prisma.booking.update({
                where: { id: proposal.bookingId },
                data: {
                    pickupLocked: false,
                    pickupStatus: client_1.PickupStatus.NOT_SCHEDULED,
                },
            }),
        ]);
        this.logger.log(`⏳ Proposal expired → ${proposalId}`);
    }
};
exports.ProposalService = ProposalService;
exports.ProposalService = ProposalService = ProposalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProposalService);
//# sourceMappingURL=proposal.service.js.map