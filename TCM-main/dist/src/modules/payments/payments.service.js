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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const client_1 = require("@prisma/client");
const stripe_1 = require("stripe");
let PaymentsService = class PaymentsService {
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async createCheckoutSession(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const amount = Number(booking.prepaidAmount);
        if (amount <= 0) {
            throw new common_1.BadRequestException('No prepaid amount required');
        }
        const payment = await this.prisma.payment.create({
            data: {
                booking: { connect: { id: booking.id } },
                User: { connect: { id: userId } },
                amount,
                method: client_1.PaymentMethod.ONLINE,
                status: client_1.PaymentStatus.PENDING,
                collectedBy: client_1.UserRole.CLIENT,
            },
        });
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Booking ${booking.id}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId: booking.id,
                paymentId: payment.id,
                userId,
            },
            success_url: `${process.env.FRONTEND_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payments/cancel`,
        });
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                stripeIntentId: session.id,
            },
        });
        return {
            checkoutUrl: session.url,
            paymentId: payment.id,
        };
    }
    async createStripePaymentIntent(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { trip: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const amount = Number(booking.prepaidAmount);
        if (amount <= 0) {
            throw new common_1.BadRequestException('No prepaid amount required');
        }
        const intent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'eur',
            metadata: {
                bookingId: booking.id,
                userId,
            },
        });
        const payment = await this.prisma.payment.create({
            data: {
                booking: { connect: { id: booking.id } },
                User: { connect: { id: userId } },
                amount,
                method: client_1.PaymentMethod.ONLINE,
                status: client_1.PaymentStatus.PENDING,
                stripeIntentId: intent.id,
                collectedBy: client_1.UserRole.CLIENT,
            },
        });
        return {
            clientSecret: intent.client_secret,
            paymentId: payment.id,
        };
    }
    async createCashPayment(bookingId, operatorId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { trip: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const amount = Number(booking.remainingAmount);
        if (amount <= 0) {
            throw new common_1.BadRequestException('No remaining amount to collect');
        }
        const payment = await this.prisma.payment.create({
            data: {
                booking: { connect: { id: booking.id } },
                User: { connect: { id: operatorId } },
                amount,
                method: client_1.PaymentMethod.CASH,
                status: client_1.PaymentStatus.COMPLETED,
                collectedBy: client_1.UserRole.TRANSPORTEUR,
            },
        });
        await this.finalizePayment(payment.id);
        return payment;
    }
    async confirmStripePayment(stripeIntentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { stripeIntentId },
        });
        if (!payment)
            return;
        if (payment.status === client_1.PaymentStatus.COMPLETED)
            return;
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: client_1.PaymentStatus.COMPLETED },
        });
        await this.finalizePayment(payment.id);
    }
    async handleFailedPayment(stripeIntentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { stripeIntentId },
        });
        if (!payment)
            return;
        if (payment.status === client_1.PaymentStatus.FAILED)
            return;
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.FAILED,
            },
        });
        console.log('Payment failed:', stripeIntentId);
    }
    async handleRefund(stripeIntentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { stripeIntentId },
            include: { booking: true },
        });
        if (!payment)
            return;
        if (payment.status === client_1.PaymentStatus.RETURNED)
            return;
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.RETURNED,
                },
            });
            const restoredAmount = Number(payment.booking.remainingAmount) +
                Number(payment.amount);
            await tx.booking.update({
                where: { id: payment.booking.id },
                data: {
                    remainingAmount: restoredAmount,
                    status: client_1.BookingStatus.CREATED,
                },
            });
        });
        console.log('Payment refunded:', stripeIntentId);
    }
    async finalizePayment(paymentId) {
        await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: {
                    booking: { include: { trip: true } },
                },
            });
            if (!payment)
                return;
            const booking = payment.booking;
            const paidAmount = Number(payment.amount);
            const remaining = Number(booking.remainingAmount) - paidAmount;
            const platform = await tx.platformPricing.findUnique({
                where: {
                    country: booking.trip.departureCountry,
                },
            });
            if (!platform) {
                throw new common_1.BadRequestException('Platform pricing not configured');
            }
            const commissionRate = platform.commissionRate ?? 0;
            const vatRate = platform.vatRate ?? 0;
            const platformCommission = paidAmount * commissionRate;
            const vatAmount = platformCommission * vatRate;
            const transporteurAmount = paidAmount - platformCommission - vatAmount;
            await this.ledger.recordForPayment({
                paymentId: payment.id,
                totalAmount: paidAmount,
                platformCommission,
                vatAmount,
                transporteurAmount,
                transporteurId: booking.trip.transporteurId,
            });
            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    remainingAmount: Math.max(0, remaining),
                    status: remaining <= 0
                        ? client_1.BookingStatus.PREPAID
                        : booking.status,
                },
            });
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map