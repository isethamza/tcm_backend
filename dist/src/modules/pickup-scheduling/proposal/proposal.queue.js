"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_connection_1 = require("../../../infra/queue/queue.connection");
const queue_constants_1 = require("../../../infra/queue/queue.constants");
exports.proposalQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.PROPOSAL, {
    connection: queue_connection_1.redisConnection,
    defaultJobOptions: {
        ...queue_constants_1.DEFAULT_JOB_OPTIONS,
        attempts: 5,
        removeOnComplete: {
            age: 3600,
            count: 1000,
        },
    },
});
//# sourceMappingURL=proposal.queue.js.map