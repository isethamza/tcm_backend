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
var PickupSchedulingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupSchedulingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const proposal_queue_1 = require("./proposal/proposal.queue");
const pickup_routing_service_1 = require("../../modules/pickup-routing/pickup-routing.service");
const audit_service_1 = require("../../modules/audit/audit.service");
const booking_mail_service_1 = require("../../modules/bookings/booking-mail.service");
const client_1 = require("@prisma/client");
let PickupSchedulingService = PickupSchedulingService_1 = class PickupSchedulingService {
    constructor(prisma, routing, audit, mail) {
        this.prisma = prisma;
        this.routing = routing;
        this.audit = audit;
        this.mail = mail;
        this.logger = new common_1.Logger(PickupSchedulingService_1.name);
    }
    async onBookingActivated(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { originHub: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.pickupLat == null) {
            let lat;
            let lng;
            if (booking.pickupOption === client_1.PickupOption.SELF_DROPOFF_AT_HUB &&
                booking.originHub) {
                lat = booking.originHub.lat;
                lng = booking.originHub.lng;
            }
            else {
                const profile = await this.prisma.profile.findUnique({
                    where: { userId: booking.clientId },
                });
                if (!profile?.lat || !profile?.lng) {
                    throw new common_1.BadRequestException('Missing profile location');
                }
                lat = profile.lat;
                lng = profile.lng;
            }
            await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    pickupLat: lat,
                    pickupLng: lng,
                    pickupStatus: client_1.PickupStatus.NOT_SCHEDULED,
                },
            });
            await this.audit.log({
                actorId: booking.clientId,
                action: client_1.AuditAction.BOOKING_ACTIVATED,
                entity: 'booking',
                entityId: booking.id,
                metadata: { lat, lng },
            });
        }
        const updated = await this.prisma.booking.updateMany({
            where: { id: bookingId, emailSentAt: null },
            data: { emailSentAt: new Date() },
        });
        if (updated.count === 1) {
            await this.mail.sendBookingPdfEmail(booking.id, booking.clientId, 'en');
            await this.audit.log({
                actorId: booking.clientId,
                action: client_1.AuditAction.BOOKING_EMAIL_CONFIRMATION_SENT,
                entity: 'booking',
                entityId: booking.id,
            });
        }
        await this.routing.enqueueTripRouting(booking.tripId);
        await this.audit.log({
            actorId: 'system',
            action: client_1.AuditAction.PICKUP_ROUTING_TRIGGERED,
            entity: 'trip',
            entityId: booking.tripId,
            metadata: { bookingId },
        });
        this.logger.log(`🚀 Booking activated → ${bookingId}`);
    }
    async lockPickup(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.pickupLocked)
            return booking;
        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                pickupLocked: true,
                pickupLockedAt: new Date(),
                pickupStatus: client_1.PickupStatus.SCHEDULED,
            },
        });
        await this.audit.log({
            actorId: 'system',
            action: client_1.AuditAction.PICKUP_ROUTING_LOCKED,
            entity: 'booking',
            entityId: bookingId,
        });
        return updated;
    }
    async createProposal(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.pickupOption !== client_1.PickupOption.ADVANCED_HOME_PICKUP) {
            throw new common_1.BadRequestException('Proposal allowed only for ADVANCED_HOME_PICKUP');
        }
        if (!booking.pickupStart || !booking.pickupEnd) {
            throw new common_1.BadRequestException('Booking not routed yet');
        }
        if (booking.pickupLocked) {
            throw new common_1.BadRequestException('Pickup already locked');
        }
        const existing = await this.prisma.schedulingProposal.findFirst({
            where: {
                bookingId,
                status: client_1.SlotProposalStatus.PENDING,
            },
        });
        if (existing)
            return existing;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const proposal = await this.prisma.schedulingProposal.create({
            data: {
                bookingId,
                startTime: booking.pickupStart,
                endTime: booking.pickupEnd,
                status: client_1.SlotProposalStatus.PENDING,
                expiresAt,
            },
        });
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { pickupStatus: client_1.PickupStatus.PROPOSED },
        });
        await this.mail.sendPickupProposalEmail({
            to: booking.clientId,
            slotStart: proposal.startTime,
            slotEnd: proposal.endTime,
            tripId: booking.tripId,
        });
        await proposal_queue_1.proposalQueue.add('expire-proposal', {
            proposalId: proposal.id,
        });
        this.logger.log(`📦 Proposal created → ${proposal.id}`);
        return proposal;
    }
    async acceptProposal(proposalId) {
        const proposal = await this.prisma.schedulingProposal.findUnique({
            where: { id: proposalId },
            include: { booking: true },
        });
        if (!proposal)
            throw new common_1.NotFoundException();
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
        return { success: true };
    }
    async rejectProposal(proposalId) {
        const proposal = await this.prisma.schedulingProposal.findUnique({
            where: { id: proposalId },
            include: { booking: true },
        });
        if (!proposal)
            throw new common_1.NotFoundException();
        if (proposal.status !== client_1.SlotProposalStatus.PENDING) {
            return { success: true };
        }
        const rejectedCount = await this.prisma.schedulingProposal.count({
            where: {
                bookingId: proposal.bookingId,
                status: client_1.SlotProposalStatus.REJECTED,
            },
        });
        const next = rejectedCount + 1;
        await this.prisma.$transaction([
            this.prisma.schedulingProposal.update({
                where: { id: proposalId },
                data: { status: client_1.SlotProposalStatus.REJECTED },
            }),
            this.prisma.booking.update({
                where: { id: proposal.bookingId },
                data: {
                    pickupLocked: next >= 2,
                    pickupStatus: client_1.PickupStatus.NOT_SCHEDULED,
                },
            }),
        ]);
        this.logger.warn(`❌ Proposal rejected → ${proposalId} (count=${next})`);
        if (next < 2) {
            await this.routing.enqueueTripRouting(proposal.booking.tripId);
        }
        return {
            status: next >= 2
                ? 'LOCKED_AFTER_MAX_REJECTIONS'
                : 'REJECTED_AND_REROUTED',
        };
    }
};
exports.PickupSchedulingService = PickupSchedulingService;
exports.PickupSchedulingService = PickupSchedulingService = PickupSchedulingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pickup_routing_service_1.PickupRoutingService,
        audit_service_1.AuditService,
        booking_mail_service_1.BookingMailService])
], PickupSchedulingService);
//# sourceMappingURL=pickup-scheduling.service.js.map