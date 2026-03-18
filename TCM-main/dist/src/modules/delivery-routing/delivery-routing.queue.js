"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryRoutingQueue = void 0;
const bullmq_1 = require("bullmq");
const queue_constants_1 = require("../../../infra/queue/queue.constants");
const queue_connection_1 = require("../../../infra/queue/queue.connection");
exports.deliveryRoutingQueue = new bullmq_1.Queue(queue_constants_1.QueueName.DELIVERY_ROUTING, {
    connection: queue_connection_1.connection,
});
//# sourceMappingURL=delivery-routing.queue.js.map