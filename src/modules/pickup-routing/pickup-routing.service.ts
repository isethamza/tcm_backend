import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PickupRoutingQueue } from './pickup-routing.queue';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PickupRoutingService {
  private readonly logger = new Logger(PickupRoutingService.name);

  constructor(private readonly prisma: PrismaService) {}

  //////////////////////
  // 🚀 ENQUEUE ROUTING
  //////////////////////
  async enqueuePickupRouting(bookingId: string) {
    if (!bookingId) {
      throw new Error('Missing bookingId for pickup routing');
    }

    try {
      this.logger.log(`Enqueuing pickup routing for booking: ${bookingId}`);

      await PickupRoutingQueue.add(
        'compute-pickup-route', 
        { bookingId }, 
        {
          jobId: `pickup-route-${bookingId}`,
          removeOnComplete: true, 
          attempts: 3, 
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        }
      );
      this.logger.log(`Pickup routing enqueued for booking: ${bookingId}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue pickup routing for booking: ${bookingId}`, err.stack);
      throw new InternalServerErrorException('Failed to enqueue pickup routing');
    }
  }

  //////////////////////
  // 🚀 FULL TRIP ROUTE COMPUTE
  //////////////////////
  async enqueueTripRouting(tripId: string) {
    if (!tripId) {
      throw new InternalServerErrorException('Missing tripId for full trip routing');
    }

    try {
      this.logger.log(`Enqueuing full trip routing for trip: ${tripId}`);

      await PickupRoutingQueue.add(
        'compute-pickup-route',
        { tripId },
        {
          jobId: `pickup-route-${tripId}`,
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        }
      );
      this.logger.log(`Full trip routing enqueued for trip: ${tripId}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue trip routing for trip: ${tripId}`, err.stack);
      throw new InternalServerErrorException('Failed to enqueue trip routing');
    }
  }

  //////////////////////
  // ⚡ SINGLE BOOKING OPTIMIZATION
  //////////////////////
  async optimizeBookingRoute(bookingId: string) {
    if (!bookingId) {
      throw new InternalServerErrorException('Missing bookingId for route optimization');
    }

    try {
      this.logger.log(`Enqueuing booking route optimization for booking: ${bookingId}`);

      await PickupRoutingQueue.add(
        'optimize-route',
        { bookingId },
        {
          jobId: `route-${bookingId}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );
      this.logger.log(`Booking route optimization enqueued for booking: ${bookingId}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue booking route optimization for booking: ${bookingId}`, err.stack);
      throw new InternalServerErrorException('Failed to enqueue booking route optimization');
    }
  }

  //////////////////////
  // 🔁 FULL TRIP REROUTE
  //////////////////////
  async rerouteTrip(tripId: string) {
    if (!tripId) {
      throw new InternalServerErrorException('Missing tripId for trip rerouting');
    }

    try {
      this.logger.log(`Enqueuing trip reroute for trip: ${tripId}`);

      await PickupRoutingQueue.add(
        'reroute-trip',
        { tripId },
        {
          jobId: `reroute-trip-${tripId}`,
          delay: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        }
      );
      this.logger.log(`Trip reroute enqueued for trip: ${tripId}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue trip reroute for trip: ${tripId}`, err.stack);
      throw new InternalServerErrorException('Failed to enqueue trip reroute');
    }
  }

  //////////////////////
  // 📍 READ ROUTE
  //////////////////////
  async getPickupRoute(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        routeStops: {
          orderBy: { order: 'asc' },
          include: {
            booking: true,
          },
        },
      },
    });

    if (!trip) {
      this.logger.warn(`Trip not found for id: ${tripId}`);
      throw new NotFoundException('Trip not found');
    }

    // ===============================
    // ROUTE NOT READY
    // ===============================
    if (!trip.routeStops.length) {
      this.logger.warn(`Route not ready for trip: ${tripId}`);
      return {
        tripId: trip.id,
        status: 'ROUTE_NOT_READY',
        totalStops: 0,
        pickupRoute: [],
        updatedAt: trip.updatedAt,
      };
    }

    // ===============================
    // BUILD RESPONSE
    // ===============================
    const pickupRoute = trip.routeStops.map((stop) => {
      const booking = stop.booking;

      if (
        booking?.pickupLat == null ||
        booking?.pickupLng == null
      ) {
        throw new InternalServerErrorException(
          `Missing coordinates for booking ${stop.bookingId}`,
        );
      }

      return {
        sequence: stop.order,
        eta: stop.eta,
        bookingId: stop.bookingId,
        location: {
          lat: booking.pickupLat,
          lng: booking.pickupLng,
        },
      };
    });

    this.logger.log(`Successfully fetched pickup route for trip: ${tripId}`);

    return {
      tripId: trip.id,
      status: 'READY',
      departureCity: trip.departureCity,
      departureDate: trip.departureDate,
      totalStops: pickupRoute.length,
      updatedAt: trip.updatedAt,
      pickupRoute,
    };
  }
}