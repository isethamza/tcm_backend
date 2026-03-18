import { Worker } from 'bullmq';
import { redisConnection } from '../infra/queue/queue.connection';
import { prisma } from '../infra/prisma';
import { PickupOption } from '@prisma/client';
import fetch from 'node-fetch';
import { QUEUES, QUEUE_CONCURRENCY } from '../infra/queue/queue.constants';

export async function startPickupRoutingWorker(): Promise<Worker> {
  const worker = new Worker(
    QUEUES.PICKUP_ROUTING,
    async job => {
      const { tripId } = job.data;

      console.log(`🚚 Processing Pickup Routing trip → ${tripId}`);

      const bookings = await prisma.booking.findMany({
        where: {
          tripId,
          pickupLocked: false,
          pickupOption: {
            in: [
              PickupOption.STANDARD_HOME_PICKUP,
              PickupOption.ADVANCED_HOME_PICKUP,
            ],
          },
          pickupLat: { not: null },
          pickupLng: { not: null },
        },
      });

      if (!bookings.length) return;

      // 👉 keep ALL your existing logic unchanged here
      // (slots, routing, mapbox, etc.)
    },
    {
      connection: redisConnection,
      concurrency: QUEUE_CONCURRENCY[QUEUES.PICKUP_ROUTING],
    },
  );

  return worker;
}