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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TripsService = class TripsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOwnedTrip(tripId, userId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                pricingRules: true,
                _count: { select: { bookings: true } },
            },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
        if (trip.transporteurId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return {
            ...trip,
            bookingsCount: trip._count.bookings,
        };
    }
    async create(dto, userId, role) {
        if (role !== client_1.UserRole.TRANSPORTEUR) {
            throw new common_1.ForbiddenException('Only transporteurs can create trips');
        }
        const approvedKyc = await this.prisma.kyc.findFirst({
            where: { userId, status: client_1.KycStatus.APPROVED },
        });
        if (!approvedKyc) {
            throw new common_1.ForbiddenException('KYC approval required');
        }
        if (!dto.pricingRules?.length) {
            throw new common_1.BadRequestException('Pricing rules are required');
        }
        if (dto.capacityKg <= 0 || dto.capacityM3 <= 0) {
            throw new common_1.BadRequestException('Capacities must be greater than zero');
        }
        return this.prisma.trip.create({
            data: {
                transporteurId: userId,
                departureCountry: dto.departureCountry,
                departureCity: dto.departureCity,
                arrivalCountry: dto.arrivalCountry,
                arrivalCity: dto.arrivalCity,
                departureDate: new Date(dto.departureDate),
                arrivalDate: new Date(dto.arrivalDate),
                capacityKg: dto.capacityKg,
                capacityM3: dto.capacityM3,
                pickupAddonFee: dto.pickupAddonFee ?? null,
                pricingRules: {
                    create: dto.pricingRules.map(r => ({
                        minKg: r.minKg,
                        maxKg: r.maxKg,
                        price: r.price,
                    })),
                },
            },
            include: {
                pricingRules: true,
                _count: { select: { bookings: true } },
            },
        }).then(trip => ({
            ...trip,
            bookingsCount: trip._count.bookings,
        }));
    }
    async myTrips(userId) {
        const trips = await this.prisma.trip.findMany({
            where: { transporteurId: userId },
            orderBy: { departureDate: 'asc' },
            include: {
                _count: { select: { bookings: true } },
            },
        });
        return trips.map(t => ({
            ...t,
            bookingsCount: t._count.bookings,
        }));
    }
    async getTripById(tripId, userId) {
        return this.getOwnedTrip(tripId, userId);
    }
    async search(params) {
        const trips = await this.prisma.trip.findMany({
            where: {
                departureCountry: params.from,
                arrivalCountry: params.to,
                departureDate: params.date
                    ? { gte: new Date(params.date) }
                    : undefined,
                status: client_1.TripStatus.PUBLISHED,
                transporteur: { status: 'ACTIVE' },
            },
            include: {
                transporteur: { select: { id: true, email: true } },
                _count: { select: { bookings: true } },
            },
        });
        return trips.map(t => ({
            ...t,
            bookingsCount: t._count.bookings,
        }));
    }
    async searchAdvanced(params) {
        return this.prisma.trip.findMany({
            where: {
                departureCountry: params.fromCountry,
                departureCity: params.fromCity,
                arrivalCountry: params.toCountry,
                arrivalCity: params.toCity,
                departureDate: params.date
                    ? { gte: new Date(params.date) }
                    : undefined,
                pricingRules: params.maxPriceKg
                    ? {
                        some: {
                            price: { lte: params.maxPriceKg },
                        },
                    }
                    : undefined,
                status: 'PUBLISHED',
            },
            include: {
                transporteur: { select: { id: true, email: true } },
                _count: { select: { bookings: true } },
            },
        });
    }
    async updateTrip(tripId, transporteurId, dto) {
        const trip = await this.getOwnedTrip(tripId, transporteurId);
        if (trip.status === client_1.TripStatus.CANCELLED)
            throw new common_1.BadRequestException('Trip is cancelled');
        if (dto.capacityKg !== undefined && dto.capacityKg <= 0) {
            throw new common_1.BadRequestException('capacityKg must be greater than zero');
        }
        if (dto.capacityM3 !== undefined && dto.capacityM3 <= 0) {
            throw new common_1.BadRequestException('capacityM3 must be greater than zero');
        }
        if (trip.bookingsCount > 0)
            throw new common_1.BadRequestException('Cannot modify trip with bookings');
        return this.prisma.trip.update({
            where: { id: tripId },
            data: dto,
        });
    }
    async publish(id, userId) {
        const trip = await this.getOwnedTrip(id, userId);
        if (trip.status !== client_1.TripStatus.DRAFT)
            throw new common_1.BadRequestException('Only draft trips can be published');
        return this.prisma.trip.update({
            where: { id },
            data: { status: client_1.TripStatus.PUBLISHED },
        });
    }
    async putBackToDraft(id, userId) {
        const trip = await this.getOwnedTrip(id, userId);
        if (trip.bookingsCount > 0)
            throw new common_1.BadRequestException('Cannot revert with bookings');
        return this.prisma.trip.update({
            where: { id },
            data: { status: client_1.TripStatus.DRAFT },
        });
    }
    async hold(id, userId) {
        await this.getOwnedTrip(id, userId);
        return this.prisma.trip.update({
            where: { id },
            data: { status: client_1.TripStatus.ON_HOLD },
        });
    }
    async resume(id, userId) {
        await this.getOwnedTrip(id, userId);
        return this.prisma.trip.update({
            where: { id },
            data: { status: client_1.TripStatus.PUBLISHED },
        });
    }
    async delay(id, newDate, userId) {
        const trip = await this.getOwnedTrip(id, userId);
        if (!newDate) {
            throw new common_1.BadRequestException('New departure date is required');
        }
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        if (parsedDate <= new Date(trip.departureDate)) {
            throw new common_1.BadRequestException('New departure date must be after current departure date');
        }
        if (parsedDate <= new Date()) {
            throw new common_1.BadRequestException('New departure date must be in the future');
        }
        return this.prisma.trip.update({
            where: { id },
            data: {
                departureDate: parsedDate,
                status: client_1.TripStatus.DELAYED,
            },
        });
    }
    async cancelTrip(id, userId) {
        const trip = await this.getOwnedTrip(id, userId);
        if (trip.status === client_1.TripStatus.CANCELLED)
            throw new common_1.BadRequestException('Already cancelled');
        return this.prisma.trip.update({
            where: { id },
            data: {
                status: client_1.TripStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });
    }
    async getPublicTripById(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                pricingRules: true,
                transporteur: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        if (!trip || trip.status !== client_1.TripStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Trip not found');
        }
        return trip;
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map