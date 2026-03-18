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
exports.RatingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RatingService = class RatingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRating(params) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: params.bookingId },
            include: { trip: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.clientId !== params.clientId)
            throw new common_1.ForbiddenException();
        if (booking.status !== client_1.BookingStatus.COMPLETED)
            throw new common_1.BadRequestException('Booking must be completed before rating');
        const existing = await this.prisma.transporteurRating.findUnique({
            where: { bookingId: params.bookingId },
        });
        if (existing)
            throw new common_1.BadRequestException('Booking already rated');
        if (params.rating < 1 || params.rating > 5)
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        const rating = await this.prisma.transporteurRating.create({
            data: {
                bookingId: params.bookingId,
                clientId: params.clientId,
                transporteurId: booking.trip.transporteurId,
                rating: params.rating,
                comment: params.comment,
                punctuality: params.punctuality,
                communication: params.communication,
                parcelCare: params.parcelCare,
            },
        });
        await this.updateTransporteurScore(booking.trip.transporteurId);
        return rating;
    }
    async updateTransporteurScore(transporteurId) {
        const ratings = await this.prisma.transporteurRating.findMany({
            where: { transporteurId },
            select: { rating: true },
        });
        const total = ratings.length;
        const average = ratings.reduce((acc, r) => acc + r.rating, 0) /
            total;
        await this.prisma.user.update({
            where: { id: transporteurId },
            data: {
                averageRating: average,
                totalRatings: total,
            },
        });
    }
    async getTransporteurRatingSummary(transporteurId) {
        return this.prisma.user.findUnique({
            where: { id: transporteurId },
            select: {
                averageRating: true,
                totalRatings: true,
            },
        });
    }
    async getTransporteurReviews(transporteurId) {
        return this.prisma.transporteurRating.findMany({
            where: { transporteurId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.RatingService = RatingService;
exports.RatingService = RatingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingService);
//# sourceMappingURL=rating.service.js.map