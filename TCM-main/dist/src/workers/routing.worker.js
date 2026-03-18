"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupRoutingWorker = void 0;
exports.pickupRoutingWorker = new Worker('pickup-routing', async (job) => {
    const { tripId } = job.data;
    console.log(`🚚 PickupRouting → ${tripId}`);
    switch (job.name) {
        case 'compute-pickup-route':
        case 'recompute-pickup-route':
            await handleRouting(tripId);
            break;
        default:
            console.warn(`⚠️ Unknown job: ${job.name}`);
    }
}, {
    connection: redis,
    concurrency: 3,
    limiter: {
        max: mapboxConfig.rateLimit.max,
        duration: mapboxConfig.rateLimit.duration,
    },
});
async function handleRouting(tripId) {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });
    if (!trip)
        return;
    const bookings = await prisma.booking.findMany({
        where: {
            tripId,
            pickupLocked: false,
            pickupOption: {
                in: [
                    PickupOption.STANDARD_HOME_PICKUP,
                    PickupOption.ADVANCED_HOME_PICKUP,
                ],
            },
        },
    });
    if (!bookings.length)
        return;
    const depot = {
        lat: trip.departureLat,
        lng: trip.departureLng,
    };
}
//# sourceMappingURL=routing.worker.js.map