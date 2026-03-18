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
var PickupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PickupService = PickupService_1 = class PickupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PickupService_1.name);
    }
    assertOperatorAccess(pickup, operatorId) {
        if (pickup.booking.trip.transporteurId !== operatorId) {
            throw new common_1.ForbiddenException('Access denied');
        }
    }
    assertBookingAccess(booking, operatorId) {
        if (booking.trip.transporteurId !== operatorId) {
            throw new common_1.ForbiddenException('Access denied');
        }
    }
    async getPickup(pickupId, operatorId) {
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
        if (!pickup)
            throw new common_1.NotFoundException('Pickup not found');
        this.assertOperatorAccess(pickup, operatorId);
        return pickup;
    }
    async startPickup(bookingId, operatorId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { trip: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        this.assertBookingAccess(booking, operatorId);
        if (booking.pickupStatus === client_1.PickupStatus.COMPLETED) {
            throw new common_1.BadRequestException('Pickup already completed');
        }
        return this.prisma.pickupSession.upsert({
            where: { bookingId },
            update: {
                status: client_1.PickupSessionStatus.STARTED,
            },
            create: {
                booking: { connect: { id: bookingId } },
                pickupOption: booking.pickupOption,
                status: client_1.PickupSessionStatus.STARTED,
            },
        });
    }
    async addArtifact(pickupId, operatorId, dto) {
        const pickup = await this.prisma.pickupSession.findUnique({
            where: { id: pickupId },
            include: {
                booking: { include: { trip: true } },
                artifacts: true,
            },
        });
        if (!pickup)
            throw new common_1.NotFoundException('Pickup not found');
        this.assertOperatorAccess(pickup, operatorId);
        if (pickup.status === client_1.PickupSessionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Pickup already completed');
        }
        const exists = pickup.artifacts.some(a => a.type === dto.type);
        if (exists) {
            throw new common_1.BadRequestException(`Artifact ${dto.type} already uploaded`);
        }
        return this.prisma.verificationArtifact.create({
            data: {
                pickup: { connect: { id: pickupId } },
                type: dto.type,
                fileUrl: dto.fileUrl,
            },
        });
    }
    async confirmParcels(pickupId, operatorId, parcels) {
        if (!parcels?.length) {
            throw new common_1.BadRequestException('No parcels provided');
        }
        const pickup = await this.prisma.pickupSession.findUnique({
            where: { id: pickupId },
            include: {
                booking: {
                    include: { trip: true, parcels: true },
                },
            },
        });
        if (!pickup)
            throw new common_1.NotFoundException('Pickup not found');
        this.assertOperatorAccess(pickup, operatorId);
        if (pickup.status === client_1.PickupSessionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Pickup already completed');
        }
        const validParcelIds = new Set(pickup.booking.parcels.map(p => p.id));
        await this.prisma.$transaction(async (tx) => {
            for (const p of parcels) {
                if (!validParcelIds.has(p.parcelId)) {
                    throw new common_1.BadRequestException(`Parcel ${p.parcelId} not part of booking`);
                }
                if (p.status === 'MISSING' || p.status === 'DAMAGED') {
                    await tx.parcel.update({
                        where: { id: p.parcelId },
                        data: { status: p.status },
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
                if (!p.status || p.status === 'VERIFIED') {
                    await tx.parcel.update({
                        where: { id: p.parcelId },
                        data: {
                            status: client_1.ParcelStatus.PICKED_UP,
                            verifiedAt: new Date(),
                        },
                    });
                }
            }
        });
        return { success: true };
    }
    async completePickup(pickupId, operatorId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const pickup = await tx.pickupSession.findUnique({
                where: { id: pickupId },
                include: {
                    booking: { include: { trip: true, parcels: true } },
                    artifacts: true,
                },
            });
            if (!pickup)
                throw new common_1.NotFoundException('Pickup not found');
            this.assertOperatorAccess(pickup, operatorId);
            if (pickup.status === client_1.PickupSessionStatus.COMPLETED) {
                return { success: true, paymentId: null };
            }
            const booking = pickup.booking;
            const uploaded = pickup.artifacts.map(a => a.type);
            if (!uploaded.includes(client_1.VerificationArtifactType.IDENTITY)) {
                throw new common_1.BadRequestException('Missing ID verification');
            }
            const hasPicked = booking.parcels.some(p => p.status === client_1.ParcelStatus.PICKED_UP);
            if (hasPicked &&
                !uploaded.includes(client_1.VerificationArtifactType.PARCEL)) {
                throw new common_1.BadRequestException('Parcel photo required');
            }
            let paymentId = null;
            if (dto.cashCollected && dto.cashCollected > 0) {
                const remaining = Number(booking.remainingAmount);
                if (dto.cashCollected > remaining) {
                    throw new common_1.BadRequestException('Cash exceeds remaining');
                }
                const payment = await tx.payment.create({
                    data: {
                        booking: { connect: { id: booking.id } },
                        User: { connect: { id: operatorId } },
                        amount: dto.cashCollected,
                        method: client_1.PaymentMethod.CASH,
                        status: client_1.PaymentStatus.COMPLETED,
                        collectedBy: client_1.UserRole.TRANSPORTEUR,
                    },
                });
                paymentId = payment.id;
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        remainingAmount: Math.max(0, remaining - dto.cashCollected),
                    },
                });
            }
            await tx.pickupSession.update({
                where: { id: pickupId },
                data: {
                    status: client_1.PickupSessionStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    pickupStatus: client_1.PickupStatus.COMPLETED,
                    status: client_1.BookingStatus.PICKED_UP,
                },
            });
            await Promise.all(booking.parcels.map(parcel => tx.trackingEvent.create({
                data: {
                    booking: { connect: { id: booking.id } },
                    parcel: { connect: { id: parcel.id } },
                    trip: { connect: { id: booking.tripId } },
                    status: client_1.BookingStatus.PICKED_UP,
                    eventType: 'PUBLIC',
                    message: 'Pickup completed',
                    location: booking.trip.departureCity,
                },
            })));
            return {
                success: true,
                paymentId,
            };
        });
    }
};
exports.PickupService = PickupService;
exports.PickupService = PickupService = PickupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PickupService);
//# sourceMappingURL=pickup.service.js.map