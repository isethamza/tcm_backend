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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandoverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HandoverService = class HandoverService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, operatorId) {
        this.validateScope(dto);
        this.validateTarget(dto);
        if (dto.batchId) {
            return this.createBatchHandover(dto, operatorId);
        }
        if (dto.parcelId) {
            return this.createParcelHandover(dto, operatorId);
        }
        throw new common_1.BadRequestException('Invalid handover scope');
    }
    async createBatchHandover(dto, operatorId) {
        const batch = await this.prisma.handoverBatch.findUnique({
            where: { id: dto.batchId },
            include: {
                parcels: true,
            },
        });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        if (batch.transporteurId !== operatorId) {
            throw new common_1.ForbiddenException();
        }
        if (batch.status !== client_1.HandoverBatchStatus.CREATED) {
            throw new common_1.BadRequestException('Batch already processed');
        }
        return this.prisma.$transaction(async (tx) => {
            const event = await tx.handoverEvent.create({
                data: {
                    batchId: batch.id,
                    fromType: client_1.UserRole.TRANSPORTEUR,
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
                    status: client_1.HandoverBatchStatus.IN_PROGRESS,
                },
            });
            return event;
        });
    }
    async createParcelHandover(dto, operatorId) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { id: dto.parcelId },
            include: {
                booking: {
                    include: { trip: true },
                },
            },
        });
        if (!parcel)
            throw new common_1.NotFoundException('Parcel not found');
        if (!parcel.booking?.trip) {
            throw new common_1.BadRequestException('Invalid parcel booking/trip');
        }
        if (parcel.booking.trip.transporteurId !== operatorId) {
            throw new common_1.ForbiddenException();
        }
        return this.prisma.handoverEvent.create({
            data: {
                parcelId: parcel.id,
                bookingId: parcel.bookingId,
                fromType: client_1.UserRole.TRANSPORTEUR,
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
    async accept(handoverId, operatorId, accept) {
        const handover = await this.prisma.handoverEvent.findUnique({
            where: { id: handoverId },
            include: {
                batch: {
                    include: { parcels: true },
                },
            },
        });
        if (!handover)
            throw new common_1.NotFoundException();
        if (handover.toUserId && handover.toUserId !== operatorId) {
            throw new common_1.ForbiddenException();
        }
        if (handover.isAccepted) {
            return { success: true };
        }
        return this.prisma.$transaction(async (tx) => {
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
            if (handover.batchId) {
                const parcelIds = handover.batch?.parcels.map(p => p.parcelId) ?? [];
                if (parcelIds.length) {
                    await tx.parcel.updateMany({
                        where: { id: { in: parcelIds } },
                        data: {
                            status: handover.declaredStatus ??
                                client_1.ParcelStatus.PICKED_UP,
                        },
                    });
                }
                await tx.handoverBatch.update({
                    where: { id: handover.batchId },
                    data: {
                        status: client_1.HandoverBatchStatus.COMPLETED,
                    },
                });
            }
            if (handover.parcelId) {
                await tx.parcel.update({
                    where: { id: handover.parcelId },
                    data: {
                        status: handover.declaredStatus ??
                            client_1.ParcelStatus.PICKED_UP,
                    },
                });
            }
            if (handover.bookingId) {
                await tx.booking.update({
                    where: { id: handover.bookingId },
                    data: {
                        status: handover.parcelId &&
                            handover.declaredStatus === client_1.ParcelStatus.PICKED_UP
                            ? client_1.BookingStatus.COMPLETED
                            : client_1.BookingStatus.IN_TRANSIT,
                    },
                });
            }
            return { success: true };
        });
    }
    async getByBooking(bookingId) {
        return this.prisma.handoverEvent.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'asc' },
        });
    }
    validateScope(dto) {
        const count = [dto.batchId, dto.parcelId].filter(Boolean).length;
        if (count !== 1) {
            throw new common_1.BadRequestException('Provide either batchId OR parcelId');
        }
    }
    validateTarget(dto) {
        if (!dto.toType) {
            throw new common_1.BadRequestException('Missing toType');
        }
        if (dto.toType === client_1.UserRole.HUB_MANAGER &&
            !dto.toHubId) {
            throw new common_1.BadRequestException('Missing toHubId');
        }
        if (dto.toType === client_1.UserRole.RECIPIENT &&
            !dto.toUserId) {
            throw new common_1.BadRequestException('Missing recipient');
        }
    }
};
exports.HandoverService = HandoverService;
exports.HandoverService = HandoverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HandoverService);
//# sourceMappingURL=handover.service.js.map