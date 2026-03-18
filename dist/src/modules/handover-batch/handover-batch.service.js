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
exports.HandoverBatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HandoverBatchService = class HandoverBatchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async autoGroupAndAssign(transporteurId, parcelIds) {
        if (!parcelIds?.length) {
            throw new common_1.BadRequestException('No parcelIds provided');
        }
        const parcels = await this.prisma.parcel.findMany({
            where: { id: { in: parcelIds } },
            include: {
                booking: { include: { trip: true } },
            },
        });
        if (!parcels.length) {
            throw new common_1.BadRequestException('No parcels found');
        }
        this.validateParcelsOwnership(parcels, transporteurId);
        this.validateParcelsEligibility(parcels);
        const groups = this.groupParcels(parcels);
        const results = [];
        await this.prisma.$transaction(async (tx) => {
            for (const [key, parcelGroupIds] of groups.entries()) {
                const destination = this.parseKey(key);
                const batch = await this.findOrCreateBatchTx(tx, transporteurId, destination);
                await this.assignParcelsToBatchTx(tx, batch.id, parcelGroupIds);
                results.push({
                    batchId: batch.id,
                    count: parcelGroupIds.length,
                });
            }
        });
        return results;
    }
    async createBatch(transporteurId, destination) {
        return this.prisma.handoverBatch.create({
            data: {
                transporteurId,
                destinationType: destination.type,
                destinationCity: destination.type === 'CITY' ? destination.value : null,
                hubId: destination.type === 'HUB' ? destination.value : null,
                tripStopId: destination.type === 'TRIP_STOP'
                    ? destination.value
                    : null,
                status: client_1.HandoverBatchStatus.CREATED,
            },
        });
    }
    async addParcels(transporteurId, batchId, parcelIds) {
        if (!parcelIds?.length) {
            throw new common_1.BadRequestException('No parcelIds provided');
        }
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.handoverBatch.findUnique({
                where: { id: batchId },
            });
            if (!batch) {
                throw new common_1.BadRequestException('Batch not found');
            }
            if (batch.transporteurId !== transporteurId) {
                throw new common_1.ForbiddenException('Not your batch');
            }
            if (batch.status !== client_1.HandoverBatchStatus.CREATED) {
                throw new common_1.BadRequestException('Cannot modify this batch');
            }
            const parcels = await tx.parcel.findMany({
                where: { id: { in: parcelIds } },
                include: {
                    booking: { include: { trip: true } },
                },
            });
            if (parcels.length !== parcelIds.length) {
                throw new common_1.BadRequestException('Some parcels not found');
            }
            this.validateParcelsOwnership(parcels, transporteurId);
            this.validateParcelsEligibility(parcels);
            for (const parcel of parcels) {
                const key = this.getBatchKey(parcel.booking);
                const parsed = this.parseKey(key);
                if (parsed.type !== batch.destinationType) {
                    throw new common_1.BadRequestException(`Parcel ${parcel.id} destination mismatch`);
                }
                if (parsed.type === 'CITY' &&
                    parsed.value !== batch.destinationCity) {
                    throw new common_1.BadRequestException(`Parcel ${parcel.id} city mismatch`);
                }
                if (parsed.type === 'HUB' &&
                    parsed.value !== batch.hubId) {
                    throw new common_1.BadRequestException(`Parcel ${parcel.id} hub mismatch`);
                }
                if (parsed.type === 'TRIP_STOP' &&
                    parsed.value !== batch.tripStopId) {
                    throw new common_1.BadRequestException(`Parcel ${parcel.id} stop mismatch`);
                }
            }
            await this.assignParcelsToBatchTx(tx, batchId, parcelIds);
            return { batchId, added: parcelIds.length };
        });
    }
    async getBatchById(transporteurId, batchId) {
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
            throw new common_1.BadRequestException('Batch not found');
        }
        if (batch.transporteurId !== transporteurId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return batch;
    }
    async listBatches(transporteurId, filters) {
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
    validateParcelsOwnership(parcels, transporteurId) {
        for (const parcel of parcels) {
            if (parcel.booking?.trip?.transporteurId !==
                transporteurId) {
                throw new common_1.ForbiddenException(`Parcel ${parcel.id} not owned`);
            }
        }
    }
    validateParcelsEligibility(parcels) {
        for (const parcel of parcels) {
            if (parcel.status !== client_1.ParcelStatus.PICKED_UP) {
                throw new common_1.BadRequestException(`Parcel ${parcel.id} not eligible`);
            }
        }
    }
    groupParcels(parcels) {
        const groups = new Map();
        for (const parcel of parcels) {
            const key = this.getBatchKey(parcel.booking);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(parcel.id);
        }
        return groups;
    }
    getBatchKey(booking) {
        switch (booking.deliveryOption) {
            case client_1.DeliveryOption.HOME_DELIVERY:
                if (!booking.destinationCity) {
                    throw new common_1.BadRequestException('Missing destinationCity');
                }
                return `CITY:${booking.destinationCity
                    .trim()
                    .toLowerCase()}`;
            case client_1.DeliveryOption.HUB_PICKUP:
                if (!booking.destinationHubId) {
                    throw new common_1.BadRequestException('Missing hub');
                }
                return `HUB:${booking.destinationHubId}`;
            case client_1.DeliveryOption.POPUP_PICKUP:
                if (!booking.deliveryTripStopId) {
                    throw new common_1.BadRequestException('Missing tripStop');
                }
                return `TRIP_STOP:${booking.deliveryTripStopId}`;
            default:
                throw new common_1.BadRequestException('Invalid deliveryOption');
        }
    }
    parseKey(key) {
        const [type, value] = key.split(':');
        return {
            type: type,
            value,
        };
    }
    async findOrCreateBatchTx(tx, transporteurId, destination) {
        const where = {
            transporteurId,
            status: client_1.HandoverBatchStatus.CREATED,
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
                    destinationCity: destination.type === 'CITY'
                        ? destination.value
                        : null,
                    hubId: destination.type === 'HUB'
                        ? destination.value
                        : null,
                    tripStopId: destination.type === 'TRIP_STOP'
                        ? destination.value
                        : null,
                    status: client_1.HandoverBatchStatus.CREATED,
                },
            });
        }
        return batch;
    }
    async assignParcelsToBatchTx(tx, batchId, parcelIds) {
        const existing = await tx.handoverBatchParcel.findMany({
            where: {
                parcelId: { in: parcelIds },
                batch: {
                    status: {
                        in: [
                            client_1.HandoverBatchStatus.CREATED,
                            client_1.HandoverBatchStatus.IN_PROGRESS,
                        ],
                    },
                },
            },
            select: { parcelId: true },
        });
        if (existing.length) {
            throw new common_1.BadRequestException(`Parcels already in active batch: ${existing
                .map(e => e.parcelId)
                .join(', ')}`);
        }
        await tx.handoverBatchParcel.createMany({
            data: parcelIds.map(parcelId => ({
                batchId,
                parcelId,
            })),
            skipDuplicates: true,
        });
    }
};
exports.HandoverBatchService = HandoverBatchService;
exports.HandoverBatchService = HandoverBatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HandoverBatchService);
//# sourceMappingURL=handover-batch.service.js.map