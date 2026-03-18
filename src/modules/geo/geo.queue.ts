import { Queue } from 'bullmq';
import { QUEUES } from 'src/infra/queue/queue.constants';
import { redisConnection } from 'src/infra/queue/queue.connection';

export const geoQueue = new Queue(QUEUES.GEO, {
  connection: redisConnection,
});