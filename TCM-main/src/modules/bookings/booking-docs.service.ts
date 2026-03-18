import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildBookingPdf } from './pdf/booking.template';
import { PdfLang } from './pdf/booking.i18n';

@Injectable()
export class BookingDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(
    bookingId: string,
    lang: PdfLang = 'en',
  ): Promise<Buffer> {
    const booking = await this.loadBookingData(bookingId);

    return buildBookingPdf({
      booking,
      lang,
    });
  }

  private async loadBookingData(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
  trip: {
    include: {
      transporteur: {
        include: {
          profile: true, // ✅
        },
      },
    },
  },
  client: {
    include: {
      profile: true, // ✅
    },
  },
  recipient: true,
  parcels: true,
  insurances: true,
  originHub: {
    include: {
      openingHours: true, // ✅
    },
  },
},
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    /* ===============================
       PICKUP DETAILS
    =============================== */

    let pickupDetails: any = null;
if (
  booking.pickupOption === 'STANDARD_HOME_PICKUP' ||
  booking.pickupOption === 'ADVANCED_HOME_PICKUP'
) {
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
      address: t.profile?.address ?? null, // ✅ CORRECT
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
          openingHours: hub.openingHours ?? null, // ✅ now valid
        };
      }
    }

    /* ===============================
       INSURANCE
    =============================== */

    const insuranceEntity = booking.insurances?.[0] ?? null;

    /* ===============================
       RETURN
    =============================== */

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

      recipientSnapshot: booking.recipientSnapshot as {
        name: string;
        phone: string;
        address: string;
      },

      parcels: booking.parcels.map(p => ({
        weightKg: p.weightKg,
        lengthCm: p.lengthCm,
        widthCm: p.widthCm,
        heightCm: p.heightCm,
        finalPrice: Number(p.finalPrice ?? 0), // ✅ safer
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
}