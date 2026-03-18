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
exports.TripStopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TripStopService = class TripStopService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOwnedTrip(tripId, transporteurId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { id: true, transporteurId: true },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
        if (trip.transporteurId !== transporteurId) {
            throw new common_1.ForbiddenException('Not your trip');
        }
        return trip;
    }
    async getOwnedStop(stopId, transporteurId) {
        const stop = await this.prisma.tripStop.findUnique({
            where: { id: stopId },
            include: {
                dropoffBookings: true,
                deliveryBookings: true,
            },
        });
        if (!stop)
            throw new common_1.NotFoundException('Stop not found');
        if (stop.transporteurId !== transporteurId) {
            throw new common_1.ForbiddenException('Not your stop');
        }
        return stop;
    }
    ensureNotUsed(stop) {
        if (stop.dropoffBookings.length > 0 ||
            stop.deliveryBookings.length > 0) {
            throw new common_1.BadRequestException('Stop already used in bookings');
        }
    }
    async create(transporteurId, dto) {
        if (dto.tripId) {
            await this.getOwnedEditableTrip(dto.tripId, transporteurId);
        }
        const order = dto.tripId
            ? await this.getNextOrder(dto.tripId)
            : null;
        return this.prisma.tripStop.create({
            data: {
                name: dto.name,
                country: dto.country,
                city: dto.city,
                order,
                transporteur: {
                    connect: { id: transporteurId },
                },
                trip: dto.tripId
                    ? { connect: { id: dto.tripId } }
                    : undefined,
                address: dto.address,
                openDate: dto.openDate,
                openTime: dto.openTime,
                closeTime: dto.closeTime,
                allowDropoff: dto.allowDropoff ?? true,
                allowPickup: dto.allowPickup ?? true,
            },
        });
    }
    async reorder(transporteurId, tripId, stopIds) {
        await this.getOwnedEditableTrip(tripId, transporteurId);
        const stops = await this.prisma.tripStop.findMany({
            where: { tripId },
            include: {
                dropoffBookings: true,
                deliveryBookings: true,
            },
        });
        if (stops.length !== stopIds.length) {
            throw new common_1.BadRequestException('Invalid stop list');
        }
        const stopMap = new Map(stops.map((s) => [s.id, s]));
        for (const id of stopIds) {
            if (!stopMap.has(id)) {
                throw new common_1.BadRequestException(`Stop ${id} does not belong to trip`);
            }
        }
        for (const stop of stops) {
            if (stop.dropoffBookings.length > 0 ||
                stop.deliveryBookings.length > 0) {
                throw new common_1.BadRequestException('Cannot reorder stops already used in bookings');
            }
        }
        return this.prisma.$transaction(stopIds.map((id, index) => this.prisma.tripStop.update({
            where: { id },
            data: { order: index + 1 },
        })));
    }
    async attach(transporteurId, stopId, tripId) {
        const stop = await this.getOwnedStop(stopId, transporteurId);
        await this.getOwnedTrip(tripId, transporteurId);
        return this.prisma.tripStop.update({
            where: { id: stop.id },
            data: {
                trip: { connect: { id: tripId } },
            },
        });
    }
    async activate(transporteurId, stopId, dto) {
        const stop = await this.getOwnedStop(stopId, transporteurId);
        return this.prisma.tripStop.update({
            where: { id: stop.id },
            data: {
                address: dto.address,
                openDate: dto.openDate,
                openTime: dto.openTime,
                closeTime: dto.closeTime,
            },
        });
    }
    async update(transporteurId, id, dto) {
        const stop = await this.getOwnedStop(id, transporteurId);
        this.ensureNotUsed(stop);
        return this.prisma.tripStop.update({
            where: { id: stop.id },
            data: dto,
        });
    }
    async listMyStops(transporteurId) {
        return this.prisma.tripStop.findMany({
            where: { transporteurId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listTripStops(tripId) {
        return this.prisma.tripStop.findMany({
            where: { tripId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getOwnedEditableTrip(tripId, transporteurId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                transporteurId: true,
                status: true,
            },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
        if (trip.transporteurId !== transporteurId) {
            throw new common_1.ForbiddenException('Not your trip');
        }
        const editableStatuses = ['CREATED', 'PREPAID'];
        if (!editableStatuses.includes(trip.status)) {
            throw new common_1.BadRequestException('Trip cannot be modified at this stage');
        }
        return trip;
    }
    async getNextOrder(tripId) {
        const lastStop = await this.prisma.tripStop.findFirst({
            where: { tripId },
            orderBy: { order: 'desc' },
        });
        return lastStop ? (lastStop.order ?? 0) + 1 : 1;
    }
    calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    async delete(transporteurId, id) {
        const stop = await this.getOwnedStop(id, transporteurId);
        this.ensureNotUsed(stop);
        return this.prisma.tripStop.delete({
            where: { id: stop.id },
        });
    }
};
exports.TripStopService = TripStopService;
exports.TripStopService = TripStopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripStopService);
//# sourceMappingURL=tripstop.service.js.map