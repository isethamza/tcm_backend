import { Queue } from 'bullmq';
import { QUEUES } from './queue.constants';
import { redisConnection } from './queue.connection';

export const mailQueue = new Queue(QUEUES.MAIL, {
  connection: redisConnection,
});