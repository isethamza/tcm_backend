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
var PickupRoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRoutingService = void 0;
const common_1 = require("@nestjs/common");
const pickup_routing_queue_1 = require("./pickup-routing.queue");
const prisma_service_1 = require("../../prisma/prisma.service");
let PickupRoutingService = PickupRoutingService_1 = class PickupRoutingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PickupRoutingService_1.name);
    }
    async enqueuePickupRouting(bookingId) {
        if (!bookingId) {
            throw new Error('Missing bookingId for pickup routing');
        }
        try {
            this.logger.log(`Enqueuing pickup routing for booking: ${bookingId}`);
            await pickup_routing_queue_1.PickupRoutingQueue.add('compute-pickup-route', { bookingId }, {
                jobId: `pickup-route-${bookingId}`,
                removeOnComplete: true,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },
            });
            this.logger.log(`Pickup routing enqueued for booking: ${bookingId}`);
        }
        catch (err) {
            this.logger.error(`Failed to enqueue pickup routing for booking: ${bookingId}`, err.stack);
            throw new common_1.InternalServerErrorException('Failed to enqueue pickup routing');
        }
    }
    async enqueueTripRouting(tripId) {
        if (!tripId) {
            throw new common_1.InternalServerErrorException('Missing tripId for full trip routing');
        }
        try {
            this.logger.log(`Enqueuing full trip routing for trip: ${tripId}`);
            await pickup_routing_queue_1.PickupRoutingQueue.add('compute-pickup-route', { tripId }, {
                jobId: `pickup-route-${tripId}`,
                removeOnComplete: true,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },
            });
            this.logger.log(`Full trip routing enqueued for trip: ${tripId}`);
        }
        catch (err) {
            this.logger.error(`Failed to enqueue trip routing for trip: ${tripId}`, err.stack);
            throw new common_1.InternalServerErrorException('Failed to enqueue trip routing');
        }
    }
    async optimizeBookingRoute(bookingId) {
        if (!bookingId) {
            throw new common_1.InternalServerErrorException('Missing bookingId for route optimization');
        }
        try {
            this.logger.log(`Enqueuing booking route optimization for booking: ${bookingId}`);
            await pickup_routing_queue_1.PickupRoutingQueue.add('optimize-route', { bookingId }, {
                jobId: `route-${bookingId}`,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            this.logger.log(`Booking route optimization enqueued for booking: ${bookingId}`);
        }
        catch (err) {
            this.logger.error(`Failed to enqueue booking route optimization for booking: ${bookingId}`, err.stack);
            throw new common_1.InternalServerErrorException('Failed to enqueue booking route optimization');
        }
    }
    async rerouteTrip(tripId) {
        if (!tripId) {
            throw new common_1.InternalServerErrorException('Missing tripId for trip rerouting');
        }
        try {
            this.logger.log(`Enqueuing trip reroute for trip: ${tripId}`);
            await pickup_routing_queue_1.PickupRoutingQueue.add('reroute-trip', { tripId }, {
                jobId: `reroute-trip-${tripId}`,
                delay: 5000,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },
            });
            this.logger.log(`Trip reroute enqueued for trip: ${tripId}`);
        }
        catch (err) {
            this.logger.error(`Failed to enqueue trip reroute for trip: ${tripId}`, err.stack);
            throw new common_1.InternalServerErrorException('Failed to enqueue trip reroute');
        }
    }
    async getPickupRoute(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                routeStops: {
                    orderBy: { order: 'asc' },
                    include: {
                        booking: true,
                    },
                },
            },
        });
        if (!trip) {
            this.logger.warn(`Trip not found for id: ${tripId}`);
            throw new common_1.NotFoundException('Trip not found');
        }
        if (!trip.routeStops.length) {
            this.logger.warn(`Route not ready for trip: ${tripId}`);
            return {
                tripId: trip.id,
                status: 'ROUTE_NOT_READY',
                totalStops: 0,
                pickupRoute: [],
                updatedAt: trip.updatedAt,
            };
        }
        const pickupRoute = trip.routeStops.map((stop) => {
            const booking = stop.booking;
            if (booking?.pickupLat == null ||
                booking?.pickupLng == null) {
                throw new common_1.InternalServerErrorException(`Missing coordinates for booking ${stop.bookingId}`);
            }
            return {
                sequence: stop.order,
                eta: stop.eta,
                bookingId: stop.bookingId,
                location: {
                    lat: booking.pickupLat,
                    lng: booking.pickupLng,
                },
            };
        });
        this.logger.log(`Successfully fetched pickup route for trip: ${tripId}`);
        return {
            tripId: trip.id,
            status: 'READY',
            departureCity: trip.departureCity,
            departureDate: trip.departureDate,
            totalStops: pickupRoute.length,
            updatedAt: trip.updatedAt,
            pickupRoute,
        };
    }
};
exports.PickupRoutingService = PickupRoutingService;
exports.PickupRoutingService = PickupRoutingService = PickupRoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PickupRoutingService);
//# sourceMappingURL=delivery-routing.service.js.map