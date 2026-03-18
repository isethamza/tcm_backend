"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRoutingQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_connection_1 = require("./queue.connection");
const queue_constants_1 = require("./queue.constants");
exports.PickupRoutingQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.PICKUP_ROUTING, {
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
//# sourceMappingURL=delivery-routing.queue.js.map