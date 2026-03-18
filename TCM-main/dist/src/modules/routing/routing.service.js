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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRoutingService = void 0;
const common_1 = require("@nestjs/common");
const pickup_routing_queue_1 = require("./pickup-routing.queue");
let PickupRoutingService = class PickupRoutingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enqueuePickupRouting(tripId) {
        await pickup_routing_queue_1.pickupRoutingQueue.add('compute-pickup-route', {
            tripId,
        });
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
            throw new NotFoundException('Trip not found');
        }
        return {
            tripId: trip.id,
            departureCity: trip.departureCity,
            departureDate: trip.departureDate,
            pickupRoute: trip.routeStops.map((stop) => ({
                sequence: stop.order,
                eta: stop.eta,
                bookingId: stop.bookingId,
                address: stop.booking?.pickupAddress,
            })),
            totalStops: trip.routeStops.length,
            updatedAt: trip.updatedAt,
        };
    }
};
exports.PickupRoutingService = PickupRoutingService;
exports.PickupRoutingService = PickupRoutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object])
], PickupRoutingService);
//# sourceMappingURL=routing.service.js.map