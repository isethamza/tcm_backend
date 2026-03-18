import { Queue } from 'bullmq';
import { QUEUES } from 'src/infra/queue/queue.constants';
import { redisConnection } from 'src/infra/queue/queue.connection';

export const deliveryRoutingQueue = new Queue(
  QUEUES.DELIVERY_ROUTING,
  {
    connection: redisConnection,
  },
);