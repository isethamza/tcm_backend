import { Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryRoutingService } from '../modules/delivery-routing/delivery-routing.service';
import { QUEUES, JOBS, QUEUE_CONCURRENCY, QUEUE_LIMITERS } from '../infra/queue/queue.constants';
import { redisConnection } from '../infra/queue/queue.connection';

export async function startDeliveryRoutingWorker(): Promise<Worker> {
  const prisma = new PrismaService();
  const service = new DeliveryRoutingService(prisma);

  const worker = new Worker(
    QUEUES.DELIVERY_ROUTING,
    async (job: Job) => {
      switch (job.name) {
        case JOBS.DELIVERY_ROUTING.COMPUTE: {
          const { tripId } = job.data;

          if (!tripId) {
            throw new Error('Missing tripId');
          }

          await service.computeRoute(tripId);
          break;
        }

        default:
          console.warn(`⚠️ Unknown job: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: QUEUE_CONCURRENCY[QUEUES.DELIVERY_ROUTING],
      limiter: QUEUE_LIMITERS[QUEUES.DELIVERY_ROUTING],
    },
  );

  /* ===============================
     EVENTS
  =============================== */

  worker.on('completed', job => {
    console.log(`✅ Delivery routing completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `❌ Delivery routing failed: ${job?.id}`,
      err,
    );
  });

  worker.on('error', err => {
    console.error('💥 Worker error (delivery-routing)', err);
  });

  return worker;
}