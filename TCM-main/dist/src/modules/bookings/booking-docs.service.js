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
exports.BookingDocsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const booking_template_1 = require("./pdf/booking.template");
let BookingDocsService = class BookingDocsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePdf(bookingId, lang = 'en') {
        const booking = await this.loadBookingData(bookingId);
        return (0, booking_template_1.buildBookingPdf)({
            booking,
            lang,
        });
    }
    async loadBookingData(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                trip: {
                    include: {
                        transporteur: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                client: {
                    include: {
                        profile: true,
                    },
                },
                recipient: true,
                parcels: true,
                insurances: true,
                originHub: {
                    include: {
                        openingHours: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        let pickupDetails = null;
        if (booking.pickupOption === 'STANDARD_HOME_PICKUP' ||
            booking.pickupOption === 'ADVANCED_HOME_PICKUP') {
            pickupDetails = {
                type: 'HOME',
                name: `${booking.client?.firstName ?? ''} ${booking.client?.lastName ?? ''}`.trim(),
                phone: booking.client?.phone ?? null,
                address: booking.client?.profile?.address ?? null,
            };
        }
        if (booking.pickupOption === 'SELF_DROPOFF_AT_TRANSPORTEUR') {
            const t = booking.trip?.transporteur;
            if (t) {
                pickupDetails = {
                    type: 'TRANSPORTEUR',
                    name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim(),
                    phone: t.phone ?? null,
                    address: t.profile?.address ?? null,
                };
            }
        }
        if (booking.pickupOption === 'SELF_DROPOFF_AT_HUB') {
            const hub = booking.originHub;
            if (hub) {
                pickupDetails = {
                    type: 'HUB',
                    name: hub.name,
                    address: hub.address,
                    openingHours: hub.openingHours ?? null,
                };
            }
        }
        const insuranceEntity = booking.insurances?.[0] ?? null;
        return {
            id: booking.id,
            trip: {
                departureCountry: booking.trip?.departureCountry,
                departureCity: booking.trip?.departureCity,
                arrivalCountry: booking.trip?.arrivalCountry,
                arrivalCity: booking.trip?.arrivalCity,
                departureDate: booking.trip?.departureDate,
                arrivalDate: booking.trip?.arrivalDate,
            },
            client: {
                firstName: booking.client?.firstName,
                lastName: booking.client?.lastName,
                email: booking.client?.email,
            },
            recipientSnapshot: booking.recipientSnapshot,
            parcels: booking.parcels.map(p => ({
                weightKg: p.weightKg,
                lengthCm: p.lengthCm,
                widthCm: p.widthCm,
                heightCm: p.heightCm,
                finalPrice: Number(p.finalPrice ?? 0),
            })),
            pickup: {
                option: booking.pickupOption,
                details: pickupDetails,
            },
            delivery: {
                option: booking.deliveryOption,
            },
            insurance: insuranceEntity
                ? {
                    declaredValue: insuranceEntity.declaredValue,
                    premiumAmount: Number(insuranceEntity.premiumAmount),
                    coverageAmount: Number(insuranceEntity.coverageAmount),
                }
                : null,
            totalPrice: Number(booking.totalPrice),
            prepaidAmount: Number(booking.prepaidAmount),
            remainingAmount: Number(booking.remainingAmount),
        };
    }
};
exports.BookingDocsService = BookingDocsService;
exports.BookingDocsService = BookingDocsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingDocsService);
//# sourceMappingURL=booking-docs.service.js.map