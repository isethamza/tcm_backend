"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
exports.routingQueue = new bullmq_1.Queue('routing', {
    connection: redis_1.redis,
});
//# sourceMappingURL=routing.queue.js.map