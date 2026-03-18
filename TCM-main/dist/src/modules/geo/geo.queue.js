"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_constants_1 = require("../../infra/queue/queue.constants");
const queue_connection_1 = require("../../infra/queue/queue.connection");
exports.geoQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.GEO, {
    connection: queue_connection_1.redisConnection,
});
//# sourceMappingURL=geo.queue.js.map