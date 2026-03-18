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
var DeliveryRoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRoutingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DeliveryRoutingService = DeliveryRoutingService_1 = class DeliveryRoutingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeliveryRoutingService_1.name);
    }
    async computeRoute(tripId) {
        this.logger.log(`🚀 Computing delivery route → ${tripId}`);
        const bookings = await this.prisma.booking.findMany({
            where: {
                tripId,
                status: {
                    in: [
                        client_1.BookingStatus.IN_TRANSIT,
                        client_1.BookingStatus.AT_DESTINATION_HUB,
                        client_1.BookingStatus.OUT_FOR_DELIVERY,
                    ],
                },
                deliveryLat: { not: null },
                deliveryLng: { not: null },
            },
            include: {
                destinationHub: true,
                deliveryTripStop: true,
            },
        });
        if (!bookings.length) {
            this.logger.warn(`⚠️ No bookings eligible for routing`);
            return;
        }
        const sorted = bookings.sort((a, b) => {
            return (a.deliveryLat ?? 0) - (b.deliveryLat ?? 0);
        });
        await this.prisma.deliveryRouteStop.deleteMany({
            where: { tripId },
        });
        await this.prisma.deliveryRouteStop.createMany({
            data: sorted.map((b, index) => ({
                tripId,
                bookingId: b.id,
                lat: b.deliveryLat,
                lng: b.deliveryLng,
                sequence: index + 1,
                destinationType: b.deliveryOption,
                hubId: b.destinationHubId,
                tripStopId: b.deliveryTripStopId,
            })),
        });
        this.logger.log(`✅ Delivery route computed → ${tripId}`);
    }
};
exports.DeliveryRoutingService = DeliveryRoutingService;
exports.DeliveryRoutingService = DeliveryRoutingService = DeliveryRoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveryRoutingService);
//# sourceMappingURL=delivery-routing.service.js.map