import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { PaymentPolicyService } from '../payments/payments-policy.service';
import { AuditService } from '../audit/audit.service';

import {
  BookingStatus,
  PickupStatus,
  UserRole,
  PickupOption,
  DeliveryOption,
  AuditAction,
} from '@prisma/client';

import { CreateBookingDto } from './dto/create-booking.dto';

import { geoQueue } from '../../modules/geo/geo.queue';
import { mailQueue } from '../../infra/queue/mail.queue';

import {
  JOBS,
  buildJobId,
  getJobOptions,
} from '../../infra/queue/queue.constants';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly paymentPolicy: PaymentPolicyService,
    private readonly audit: AuditService,
  ) {}

  /* =====================================================
     CREATE BOOKING (ASYNC GEO + MAIL)
  ===================================================== */
  async create(userId: string, dto: CreateBookingDto) {
    //////////////////////////////////////
    // VALIDATION
    //////////////////////////////////////
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
    });

    if (!trip) throw new BadRequestException('Trip not found');

    const recipient = await this.prisma.recipient.findFirst({
      where: { id: dto.recipientId, clientId: userId },
    });

    if (!recipient) {
      throw new BadRequestException('Recipient not found');
    }

    if (!dto.parcels?.length) {
      throw new BadRequestException('At least one parcel required');
    }

    //////////////////////////////////////
    // PROFILE VALIDATION
    //////////////////////////////////////
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { lat: true, lng: true },
    });

    const isHomePickup =
      dto.pickupOption === PickupOption.STANDARD_HOME_PICKUP ||
      dto.pickupOption === PickupOption.ADVANCED_HOME_PICKUP;

    if (isHomePickup && (!profile?.lat || !profile?.lng)) {
      throw new BadRequestException(
        'Profile address required for home pickup',
      );
    }

    //////////////////////////////////////
    // PRICING
    //////////////////////////////////////
    const pricing = await this.pricing.preview({
      tripId: dto.tripId,
      parcels: dto.parcels,
      pickupOption: dto.pickupOption,
      deliveryOption:
        dto.deliveryOption ?? DeliveryOption.HOME_DELIVERY,
      insurance: dto.insurance,
    });

    //////////////////////////////////////
    // PAYMENT POLICY
    //////////////////////////////////////
    const cashAllowed =
      await this.paymentPolicy.isCashAllowedForBooking({
        transporteurId: trip.transporteurId,
      });

    if (!cashAllowed && pricing.prepaidAmount <= 0) {
      throw new BadRequestException('Prepayment required');
    }

    //////////////////////////////////////
    // PICKUP STATE
    //////////////////////////////////////
    const pickupStatus = isHomePickup
      ? PickupStatus.NOT_SCHEDULED
      : PickupStatus.COMPLETED;

    const pickupLocked = !isHomePickup;

    //////////////////////////////////////
    // CREATE BOOKING
    //////////////////////////////////////
    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        tripId: dto.tripId,
        recipientId: dto.recipientId,

        pickupLat: null,
        pickupLng: null,
        pickupGeoStatus: 'PENDING',
        deliveryGeoStatus:
          dto.deliveryOption === DeliveryOption.HOME_DELIVERY
            ? 'PENDING'
            : null,

        pickupOption: dto.pickupOption,
        deliveryOption:
          dto.deliveryOption ?? DeliveryOption.HOME_DELIVERY,

        deliveryPrice: pricing.breakdown.deliveryPrice,
        pickupFee: pricing.breakdown.pickupFee,
        serviceFee: pricing.breakdown.serviceFee,
        hubFee:
          pricing.breakdown.hubPickupFee ??
          pricing.breakdown.hubDeliveryFee ??
          null,

        totalPrice: pricing.totalPrice,
        prepaidAmount: pricing.prepaidAmount,
        remainingAmount: pricing.remainingAmount,

        status: BookingStatus.CREATED,
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

    //////////////////////////////////////
    // 🚀 GEO QUEUE
    //////////////////////////////////////
    await geoQueue.add(
      JOBS.GEO.GEOCODE_BOOKING,
      { bookingId: booking.id },
      getJobOptions(buildJobId(['geo', booking.id])),
    );

    //////////////////////////////////////
    // 📧 MAIL QUEUE
    //////////////////////////////////////
    if (booking.client?.email) {
      await mailQueue.add(
        JOBS.MAIL.SEND,
        {
          bookingId: booking.id,
          email: booking.client.email,
        },
        getJobOptions(buildJobId(['mail', booking.id])),
      );
    }

    //////////////////////////////////////
    // 📊 AUDIT
    //////////////////////////////////////
    await this.audit.log({
      actorId: userId,
      action: AuditAction.BOOKING_ACTIVATED, // ✅ fixed enum
      entity: 'booking',
      entityId: booking.id,
      metadata: {
        pricing,
        pickupOption: dto.pickupOption,
      },
    });

    return booking;
  }

  /* =====================================================
     PREVIEW PRICE
  ===================================================== */
  async previewPrice(dto: {
    tripId: string;
    parcels: any[];
    pickupOption: PickupOption;
    deliveryOption: DeliveryOption;
    insurance?: any;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
      select: { transporteurId: true },
    });

    if (!trip) throw new BadRequestException('Trip not found');
    if (!dto.parcels?.length) {
      throw new BadRequestException('At least one parcel required');
    }

    const pricing = await this.pricing.preview(dto);

    const cashAllowed =
      await this.paymentPolicy.isCashAllowedForBooking({
        transporteurId: trip.transporteurId,
      });

    return {
      breakdown: pricing.breakdown,
      parcels: pricing.parcels,
      totalWeightKg: pricing.parcels.reduce(
        (s, p) => s + p.chargeableWeightKg,
        0,
      ),
      totalPrice: pricing.totalPrice,
      prepaidAmount: pricing.prepaidAmount,
      remainingAmount: pricing.remainingAmount,
      insurance: pricing.insurance ?? null,
      payment: {
        cashAllowed,
        requiresPrepayment:
          !cashAllowed && pricing.prepaidAmount <= 0,
      },
    };
  }

  /* =====================================================
     MY BOOKINGS (PAGINATED)
  ===================================================== */
  async myBookings(
    clientId: string,
    query?: { page?: number; limit?: number },
  ) {
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

  /* =====================================================
     GET BOOKING (RBAC)
  ===================================================== */
  async getBooking(
    bookingId: string,
    user: { id: string; role: UserRole },
  ) {
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
      throw new NotFoundException('Booking not found');
    }

    if (
      user.role === UserRole.CLIENT &&
      booking.clientId !== user.id
    ) {
      throw new ForbiddenException();
    }

    if (
      user.role === UserRole.TRANSPORTEUR &&
      booking.trip.transporteurId !== user.id
    ) {
      throw new ForbiddenException();
    }

    return booking;
  }
}