"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
const queue_constants_1 = require("../../../infra/queue/queue.constants");
const defaultJobOptions = {
    attempts: 5,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: {
        age: 3600,
        count: 1000,
    },
    removeOnFail: false,
};
exports.routingQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.ROUTING, {
    connection: redis_1.redis,
    defaultJobOptions,
});
//# sourceMappingURL=routing.queue.js.map