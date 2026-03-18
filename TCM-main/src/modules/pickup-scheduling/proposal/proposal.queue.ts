import { Queue } from 'bullmq';

import { redisConnection } from 'src/infra/queue/queue.connection';
import {
  QUEUES,
  DEFAULT_JOB_OPTIONS,
} from 'src/infra/queue/queue.constants';

export const proposalQueue = new Queue(QUEUES.PROPOSAL, {
  connection: redisConnection,

  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,

    // 🔥 override for proposal-specific behavior
    attempts: 5,

    removeOnComplete: {
      age: 3600, // keep 1h
      count: 1000,
    },
  },
});