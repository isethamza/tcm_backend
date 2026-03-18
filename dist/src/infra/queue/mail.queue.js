"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_constants_1 = require("./queue.constants");
const queue_connection_1 = require("./queue.connection");
exports.mailQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.MAIL, {
    connection: queue_connection_1.redisConnection,
});
//# sourceMappingURL=mail.queue.js.map