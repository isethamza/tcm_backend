import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryOption } from '@prisma/client';

@Injectable()
export class RouteManifestService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     GET TRIP MANIFEST (DRIVER VIEW)
  ===================================================== */
  async getTripManifest(tripId: string) {
    const stops = await this.prisma.deliveryRouteStop.findMany({
      where: { tripId },
      orderBy: { sequence: 'asc' },
      include: {
        booking: {
          include: {
            parcels: true,
            destinationHub: true,
            deliveryTripStop: true,
          },
        },
      },
    });

    if (!stops.length) {
      throw new NotFoundException('No delivery route found');
    }

    /* ===============================
       LOAD BATCHES (OPTIMIZED)
    =============================== */
    const batches = await this.prisma.handoverBatch.findMany({
      where: { tripId },
      include: { parcels: true },
    });

    return stops.map(stop => {
      const booking = stop.booking;

      const actions = [];

      /* ===============================
         HOME DELIVERY
      =============================== */
      if (booking.deliveryOption === DeliveryOption.HOME_DELIVERY) {
        actions.push({
          type: 'DELIVER',
          bookingId: booking.id,
          parcelCount: booking.parcels.length,
        });
      }

      /* ===============================
         HUB HANDOVER
      =============================== */
      if (booking.destinationHubId) {
        const batch = batches.find(
          b => b.hubId === booking.destinationHubId,
        );

        actions.push({
          type: 'HANDOVER_BATCH',
          batchId: batch?.id,
          parcelCount: batch?.parcels.length ?? 0,
        });
      }

      /* ===============================
         POPUP HANDOVER
      =============================== */
      if (booking.deliveryTripStopId) {
        const batch = batches.find(
          b => b.tripStopId === booking.deliveryTripStopId,
        );

        actions.push({
          type: 'HANDOVER_BATCH',
          batchId: batch?.id,
          parcelCount: batch?.parcels.length ?? 0,
        });
      }

      return {
        stopId: stop.id,
        sequence: stop.sequence,
        eta: stop.eta,

        location: {
          lat: stop.lat,
          lng: stop.lng,
          label:
            booking.destinationHub?.name ||
            booking.deliveryTripStop?.name ||
            'Home Delivery',
        },

        actions,
      };
    });
  }
}