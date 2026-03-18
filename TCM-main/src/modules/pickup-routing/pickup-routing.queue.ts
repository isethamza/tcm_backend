import { Queue } from 'bullmq';

import { redisConnection } from 'src/infra/queue/queue.connection';
import {
  QUEUES,
  DEFAULT_JOB_OPTIONS,
} from 'src/infra/queue/queue.constants';

export const PickupRoutingQueue = new Queue(
  QUEUES.PICKUP_ROUTING,
  {
    connection: redisConnection,

    defaultJobOptions: {
      ...DEFAULT_JOB_OPTIONS,

      // 🔥 routing-specific tuning
      attempts: 5,

      removeOnComplete: {
        age: 3600, // keep 1h
        count: 1000,
      },
    },
  },
);