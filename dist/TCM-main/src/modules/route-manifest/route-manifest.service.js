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
exports.RouteManifestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RouteManifestService = class RouteManifestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTripManifest(tripId) {
        const stops = await this.prisma.deliveryRouteStop.findMany({
            where: { tripId },
            orderBy: { sequence: 'asc' },
            include: {
                booking: {
                    include: {
                        parcels: true,
                        destinationHub: true,
                        deliveryTripStop: true,
                    },
                },
            },
        });
        if (!stops.length) {
            throw new common_1.NotFoundException('No delivery route found');
        }
        const batches = await this.prisma.handoverBatch.findMany({
            where: { tripId },
            include: { parcels: true },
        });
        return stops.map(stop => {
            const booking = stop.booking;
            const actions = [];
            if (booking.deliveryOption === client_1.DeliveryOption.HOME_DELIVERY) {
                actions.push({
                    type: 'DELIVER',
                    bookingId: booking.id,
                    parcelCount: booking.parcels.length,
                });
            }
            if (booking.destinationHubId) {
                const batch = batches.find(b => b.hubId === booking.destinationHubId);
                actions.push({
                    type: 'HANDOVER_BATCH',
                    batchId: batch?.id,
                    parcelCount: batch?.parcels.length ?? 0,
                });
            }
            if (booking.deliveryTripStopId) {
                const batch = batches.find(b => b.tripStopId === booking.deliveryTripStopId);
                actions.push({
                    type: 'HANDOVER_BATCH',
                    batchId: batch?.id,
                    parcelCount: batch?.parcels.length ?? 0,
                });
            }
            return {
                stopId: stop.id,
                sequence: stop.sequence,
                eta: stop.eta,
                location: {
                    lat: stop.lat,
                    lng: stop.lng,
                    label: booking.destinationHub?.name ||
                        booking.deliveryTripStop?.name ||
                        'Home Delivery',
                },
                actions,
            };
        });
    }
};
exports.RouteManifestService = RouteManifestService;
exports.RouteManifestService = RouteManifestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RouteManifestService);
//# sourceMappingURL=route-manifest.service.js.map