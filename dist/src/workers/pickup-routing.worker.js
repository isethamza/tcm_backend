"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPickupRoutingWorker = startPickupRoutingWorker;
const bullmq_1 = require("bullmq");
const queue_connection_1 = require("../infra/queue/queue.connection");
const prisma_1 = require("../infra/prisma");
const client_1 = require("@prisma/client");
const queue_constants_1 = require("../infra/queue/queue.constants");
async function startPickupRoutingWorker() {
    const worker = new bullmq_1.Worker(queue_constants_1.QUEUES.PICKUP_ROUTING, async (job) => {
        const { tripId } = job.data;
        console.log(`🚚 Processing Pickup Routing trip → ${tripId}`);
        const bookings = await prisma_1.prisma.booking.findMany({
            where: {
                tripId,
                pickupLocked: false,
                pickupOption: {
                    in: [
                        client_1.PickupOption.STANDARD_HOME_PICKUP,
                        client_1.PickupOption.ADVANCED_HOME_PICKUP,
                    ],
                },
                pickupLat: { not: null },
                pickupLng: { not: null },
            },
        });
        if (!bookings.length)
            return;
    }, {
        connection: queue_connection_1.redisConnection,
        concurrency: queue_constants_1.QUEUE_CONCURRENCY[queue_constants_1.QUEUES.PICKUP_ROUTING],
    });
    return worker;
}
//# sourceMappingURL=pickup-routing.worker.js.map