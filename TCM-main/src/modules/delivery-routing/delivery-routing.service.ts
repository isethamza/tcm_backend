import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryOption, BookingStatus } from '@prisma/client';

@Injectable()
export class DeliveryRoutingService {
  private readonly logger = new Logger(DeliveryRoutingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     COMPUTE DELIVERY ROUTE (IDEMPOTENT)
  ===================================================== */
  async computeRoute(tripId: string) {
    this.logger.log(`🚀 Computing delivery route → ${tripId}`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        tripId,
        status: {
          in: [
            BookingStatus.IN_TRANSIT,
            BookingStatus.AT_DESTINATION_HUB,
            BookingStatus.OUT_FOR_DELIVERY,
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

    /* ===============================
       SIMPLE SORT (MVP)
       👉 Replace with VRP later
    =============================== */
    const sorted = bookings.sort((a, b) => {
      return (a.deliveryLat ?? 0) - (b.deliveryLat ?? 0);
    });

    /* ===============================
       RESET ROUTE (IDEMPOTENT)
    =============================== */
    await this.prisma.deliveryRouteStop.deleteMany({
      where: { tripId },
    });

    /* ===============================
       CREATE ROUTE STOPS
    =============================== */
    await this.prisma.deliveryRouteStop.createMany({
      data: sorted.map((b, index) => ({
        tripId,
        bookingId: b.id,
        lat: b.deliveryLat!,
        lng: b.deliveryLng!,
        sequence: index + 1,
        destinationType: b.deliveryOption,
        hubId: b.destinationHubId,
        tripStopId: b.deliveryTripStopId,
      })),
    });

    this.logger.log(`✅ Delivery route computed → ${tripId}`);
  }
}