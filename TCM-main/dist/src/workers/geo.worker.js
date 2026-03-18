"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGeoWorker = startGeoWorker;
const bullmq_1 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const geo_service_1 = require("../modules/geo/geo.service");
const queue_connection_1 = require("../infra/queue/queue.connection");
const queue_constants_1 = require("../infra/queue/queue.constants");
async function startGeoWorker() {
    const prisma = new prisma_service_1.PrismaService();
    const geo = new geo_service_1.GeoService();
    const worker = new bullmq_1.Worker(queue_constants_1.QUEUES.GEO, async (job) => {
        if (job.name !== 'geocode-booking')
            return;
        const { bookingId } = job.data;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            return;
        try {
            if (booking.deliveryGeoStatus === 'PENDING') {
                const snapshot = booking.recipientSnapshot;
                const address = `${snapshot.address}, ${snapshot.city}, ${snapshot.country}`;
                const { lat, lng } = await geo.geocodeAddress(address);
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        deliveryLat: lat,
                        deliveryLng: lng,
                        deliveryGeoStatus: 'SUCCESS',
                    },
                });
            }
            console.log(`✅ Geo done → ${bookingId}`);
        }
        catch (err) {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { deliveryGeoStatus: 'FAILED' },
            });
            throw err;
        }
    }, {
        connection: queue_connection_1.redisConnection,
        concurrency: 10,
    });
    return worker;
}
//# sourceMappingURL=geo.worker.js.map