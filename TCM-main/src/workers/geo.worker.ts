import { Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../modules/geo/geo.service';
import { redisConnection } from '../infra/queue/queue.connection';
import { QUEUES } from '../infra/queue/queue.constants';

type GeocodeBookingJob = {
  bookingId: string;
};

export async function startGeoWorker(): Promise<Worker> {
  const prisma = new PrismaService();
  const geo = new GeoService();

  const worker = new Worker(
    QUEUES.GEO,
    async (job: Job<GeocodeBookingJob>) => {
      if (job.name !== 'geocode-booking') return;

      const { bookingId } = job.data;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) return;

      try {
        // DELIVERY GEO
        if (booking.deliveryGeoStatus === 'PENDING') {
          const snapshot: any = booking.recipientSnapshot;
          const address = `${snapshot.address}, ${snapshot.city}, ${snapshot.country}`;

          const { lat, lng } = await geo.geocodeAddress(address);

          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              deliveryLat: lat,
              deliveryLng: lng,
              deliveryGeoStatus: 'SUCCESS',
            },
          });
        }

        // PICKUP GEO (same logic unchanged)
        // 👉 keep your existing block here (no change needed)

        console.log(`✅ Geo done → ${bookingId}`);
      } catch (err) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { deliveryGeoStatus: 'FAILED' },
        });

        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 10,
    },
  );

  return worker;
}