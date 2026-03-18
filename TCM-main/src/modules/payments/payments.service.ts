import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

import {
  PaymentMethod,
  PaymentStatus,
  BookingStatus,
  UserRole,
} from '@prisma/client';

import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  /* ======================================================
     STRIPE CHECKOUT SESSION
  ====================================================== */
  async createCheckoutSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const amount = Number(booking.prepaidAmount);

    if (amount <= 0) {
      throw new BadRequestException('No prepaid amount required');
    }

    const payment = await this.prisma.payment.create({
      data: {
        booking: { connect: { id: booking.id } },
        User: { connect: { id: userId } },
        amount,
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
        collectedBy: UserRole.CLIENT,
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

  /* ======================================================
     STRIPE PAYMENT INTENT
  ====================================================== */
  async createStripePaymentIntent(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const amount = Number(booking.prepaidAmount);

    if (amount <= 0) {
      throw new BadRequestException('No prepaid amount required');
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
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
        stripeIntentId: intent.id,
        collectedBy: UserRole.CLIENT,
      },
    });

    return {
      clientSecret: intent.client_secret,
      paymentId: payment.id,
    };
  }

  /* ======================================================
     CASH PAYMENT
  ====================================================== */
  async createCashPayment(bookingId: string, operatorId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const amount = Number(booking.remainingAmount);

    if (amount <= 0) {
      throw new BadRequestException('No remaining amount to collect');
    }

    const payment = await this.prisma.payment.create({
      data: {
        booking: { connect: { id: booking.id } },
        User: { connect: { id: operatorId } },
        amount,
        method: PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        collectedBy: UserRole.TRANSPORTEUR,
      },
    });

    await this.finalizePayment(payment.id);

    return payment;
  }

  /* ======================================================
     STRIPE CONFIRMATION (WEBHOOK)
  ====================================================== */
  async confirmStripePayment(stripeIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripeIntentId },
    });

    if (!payment) return;
    if (payment.status === PaymentStatus.COMPLETED) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED },
    });

    await this.finalizePayment(payment.id);
  }

  /* ======================================================
     HANDLE FAILED PAYMENT
  ====================================================== */
  async handleFailedPayment(stripeIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripeIntentId },
    });

    if (!payment) return;

    if (payment.status === PaymentStatus.FAILED) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    // Do NOT cancel booking → allow retry
    console.log('Payment failed:', stripeIntentId);
  }

  /* ======================================================
     HANDLE REFUND
  ====================================================== */
  async handleRefund(stripeIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripeIntentId },
      include: { booking: true },
    });

    if (!payment) return;

    if (payment.status === PaymentStatus.RETURNED) return;

    await this.prisma.$transaction(async tx => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.RETURNED,
        },
      });

      const restoredAmount =
        Number(payment.booking.remainingAmount) +
        Number(payment.amount);

      await tx.booking.update({
        where: { id: payment.booking.id },
        data: {
          remainingAmount: restoredAmount,
          status: BookingStatus.CREATED,
        },
      });
    });

    console.log('Payment refunded:', stripeIntentId);
  }

  /* ======================================================
     FINALIZE PAYMENT (TX SAFE)
  ====================================================== */
  private async finalizePayment(paymentId: string) {
    await this.prisma.$transaction(async tx => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: { include: { trip: true } },
        },
      });

      if (!payment) return;

      const booking = payment.booking;
      const paidAmount = Number(payment.amount);

      const remaining =
        Number(booking.remainingAmount) - paidAmount;

      const platform = await tx.platformPricing.findUnique({
        where: {
          country: booking.trip.departureCountry,
        },
      });

      if (!platform) {
        throw new BadRequestException(
          'Platform pricing not configured',
        );
      }

      const commissionRate = platform.commissionRate ?? 0;
      const vatRate = platform.vatRate ?? 0;

      const platformCommission = paidAmount * commissionRate;
      const vatAmount = platformCommission * vatRate;

      const transporteurAmount =
        paidAmount - platformCommission - vatAmount;

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
          status:
            remaining <= 0
              ? BookingStatus.PREPAID
              : booking.status,
        },
      });
    });
  }
}