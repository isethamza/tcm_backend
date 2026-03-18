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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
const payments_policy_service_1 = require("../payments/payments-policy.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
const geo_queue_1 = require("../../modules/geo/geo.queue");
const mail_queue_1 = require("../../infra/queue/mail.queue");
const queue_constants_1 = require("../../infra/queue/queue.constants");
let BookingsService = class BookingsService {
    constructor(prisma, pricing, paymentPolicy, audit) {
        this.prisma = prisma;
        this.pricing = pricing;
        this.paymentPolicy = paymentPolicy;
        this.audit = audit;
    }
    async create(userId, dto) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: dto.tripId },
        });
        if (!trip)
            throw new common_1.BadRequestException('Trip not found');
        const recipient = await this.prisma.recipient.findFirst({
            where: { id: dto.recipientId, clientId: userId },
        });
        if (!recipient) {
            throw new common_1.BadRequestException('Recipient not found');
        }
        if (!dto.parcels?.length) {
            throw new common_1.BadRequestException('At least one parcel required');
        }
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { lat: true, lng: true },
        });
        const isHomePickup = dto.pickupOption === client_1.PickupOption.STANDARD_HOME_PICKUP ||
            dto.pickupOption === client_1.PickupOption.ADVANCED_HOME_PICKUP;
        if (isHomePickup && (!profile?.lat || !profile?.lng)) {
            throw new common_1.BadRequestException('Profile address required for home pickup');
        }
        const pricing = await this.pricing.preview({
            tripId: dto.tripId,
            parcels: dto.parcels,
            pickupOption: dto.pickupOption,
            deliveryOption: dto.deliveryOption ?? client_1.DeliveryOption.HOME_DELIVERY,
            insurance: dto.insurance,
        });
        const cashAllowed = await this.paymentPolicy.isCashAllowedForBooking({
            transporteurId: trip.transporteurId,
        });
        if (!cashAllowed && pricing.prepaidAmount <= 0) {
            throw new common_1.BadRequestException('Prepayment required');
        }
        const pickupStatus = isHomePickup
            ? client_1.PickupStatus.NOT_SCHEDULED
            : client_1.PickupStatus.COMPLETED;
        const pickupLocked = !isHomePickup;
        const booking = await this.prisma.booking.create({
            data: {
                clientId: userId,
                tripId: dto.tripId,
                recipientId: dto.recipientId,
                pickupLat: null,
                pickupLng: null,
                pickupGeoStatus: 'PENDING',
                deliveryGeoStatus: dto.deliveryOption === client_1.DeliveryOption.HOME_DELIVERY
                    ? 'PENDING'
                    : null,
                pickupOption: dto.pickupOption,
                deliveryOption: dto.deliveryOption ?? client_1.DeliveryOption.HOME_DELIVERY,
                deliveryPrice: pricing.breakdown.deliveryPrice,
                pickupFee: pricing.breakdown.pickupFee,
                serviceFee: pricing.breakdown.serviceFee,
                hubFee: pricing.breakdown.hubPickupFee ??
                    pricing.breakdown.hubDeliveryFee ??
                    null,
                totalPrice: pricing.totalPrice,
                prepaidAmount: pricing.prepaidAmount,
                remainingAmount: pricing.remainingAmount,
                status: client_1.BookingStatus.CREATED,
                pickupStatus,
                pickupLocked,
                recipientSnapshot: {
                    name: `${recipient.firstName} ${recipient.lastName}`,
                    phone: recipient.phone,
                    email: recipient.email,
                    address: recipient.address,
                    city: recipient.city,
                    country: recipient.country,
                    postalCode: recipient.postalCode,
                },
                parcels: {
                    create: dto.parcels.map(p => ({
                        weightKg: p.weightKg,
                        lengthCm: p.lengthCm,
                        widthCm: p.widthCm,
                        heightCm: p.heightCm,
                        estimatedValue: p.estimatedValue,
                        customsItems: {
                            create: p.customsItems,
                        },
                    })),
                },
            },
            include: {
                client: { select: { email: true } },
            },
        });
        await geo_queue_1.geoQueue.add(queue_constants_1.JOBS.GEO.GEOCODE_BOOKING, { bookingId: booking.id }, (0, queue_constants_1.getJobOptions)((0, queue_constants_1.buildJobId)(['geo', booking.id])));
        if (booking.client?.email) {
            await mail_queue_1.mailQueue.add(queue_constants_1.JOBS.MAIL.SEND, {
                bookingId: booking.id,
                email: booking.client.email,
            }, (0, queue_constants_1.getJobOptions)((0, queue_constants_1.buildJobId)(['mail', booking.id])));
        }
        await this.audit.log({
            actorId: userId,
            action: client_1.AuditAction.BOOKING_ACTIVATED,
            entity: 'booking',
            entityId: booking.id,
            metadata: {
                pricing,
                pickupOption: dto.pickupOption,
            },
        });
        return booking;
    }
    async previewPrice(dto) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: dto.tripId },
            select: { transporteurId: true },
        });
        if (!trip)
            throw new common_1.BadRequestException('Trip not found');
        if (!dto.parcels?.length) {
            throw new common_1.BadRequestException('At least one parcel required');
        }
        const pricing = await this.pricing.preview(dto);
        const cashAllowed = await this.paymentPolicy.isCashAllowedForBooking({
            transporteurId: trip.transporteurId,
        });
        return {
            breakdown: pricing.breakdown,
            parcels: pricing.parcels,
            totalWeightKg: pricing.parcels.reduce((s, p) => s + p.chargeableWeightKg, 0),
            totalPrice: pricing.totalPrice,
            prepaidAmount: pricing.prepaidAmount,
            remainingAmount: pricing.remainingAmount,
            insurance: pricing.insurance ?? null,
            payment: {
                cashAllowed,
                requiresPrepayment: !cashAllowed && pricing.prepaidAmount <= 0,
            },
        };
    }
    async myBookings(clientId, query) {
        const page = Math.max(1, query?.page ?? 1);
        const limit = Math.min(50, query?.limit ?? 10);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.booking.findMany({
                where: { clientId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    trip: true,
                    parcels: true,
                },
            }),
            this.prisma.booking.count({ where: { clientId } }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getBooking(bookingId, user) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                trip: true,
                parcels: {
                    include: { customsItems: true },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (user.role === client_1.UserRole.CLIENT &&
            booking.clientId !== user.id) {
            throw new common_1.ForbiddenException();
        }
        if (user.role === client_1.UserRole.TRANSPORTEUR &&
            booking.trip.transporteurId !== user.id) {
            throw new common_1.ForbiddenException();
        }
        return booking;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.PricingService,
        payments_policy_service_1.PaymentPolicyService,
        audit_service_1.AuditService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map