"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDeliveryRoutingWorker = startDeliveryRoutingWorker;
const bullmq_1 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const delivery_routing_service_1 = require("../modules/delivery-routing/delivery-routing.service");
const queue_constants_1 = require("../infra/queue/queue.constants");
const queue_connection_1 = require("../infra/queue/queue.connection");
async function startDeliveryRoutingWorker() {
    const prisma = new prisma_service_1.PrismaService();
    const service = new delivery_routing_service_1.DeliveryRoutingService(prisma);
    const worker = new bullmq_1.Worker(queue_constants_1.QUEUES.DELIVERY_ROUTING, async (job) => {
        switch (job.name) {
            case queue_constants_1.JOBS.DELIVERY_ROUTING.COMPUTE: {
                const { tripId } = job.data;
                if (!tripId) {
                    throw new Error('Missing tripId');
                }
                await service.computeRoute(tripId);
                break;
            }
            default:
                console.warn(`⚠️ Unknown job: ${job.name}`);
        }
    }, {
        connection: queue_connection_1.redisConnection,
        concurrency: queue_constants_1.QUEUE_CONCURRENCY[queue_constants_1.QUEUES.DELIVERY_ROUTING],
        limiter: queue_constants_1.QUEUE_LIMITERS[queue_constants_1.QUEUES.DELIVERY_ROUTING],
    });
    worker.on('completed', job => {
        console.log(`✅ Delivery routing completed: ${job.id}`);
    });
    worker.on('failed', (job, err) => {
        console.error(`❌ Delivery routing failed: ${job?.id}`, err);
    });
    worker.on('error', err => {
        console.error('💥 Worker error (delivery-routing)', err);
    });
    return worker;
}
//# sourceMappingURL=delivery-routing.worker.js.map