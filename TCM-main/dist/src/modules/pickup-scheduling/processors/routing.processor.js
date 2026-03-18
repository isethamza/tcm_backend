"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
new bullmq_1.Worker('routing', async (job) => {
    const { bookingId } = job.data;
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking)
        return;
    const bookings = await prisma.booking.findMany({
        where: {
            tripId: booking.tripId,
            pickupLocked: false,
        },
    });
    const route = await fakeRouting(bookings);
    const slots = buildSlots(route);
    for (const slot of slots) {
        for (const stop of slot.stops) {
            await prisma.booking.update({
                where: { id: stop.bookingId },
                data: {
                    pickupStart: slot.start,
                    pickupEnd: slot.end,
                    pickupStatus: 'ROUTED',
                },
            });
        }
    }
}, { connection: redis_1.redis });
async function fakeRouting(bookings) {
    return bookings.map((b, i) => ({
        bookingId: b.id,
        eta: new Date(Date.now() + i * 30 * 60000),
    }));
}
function buildSlots(route) {
    return [
        {
            start: new Date(),
            end: new Date(Date.now() + 6 * 3600000),
            stops: route,
        },
    ];
}
//# sourceMappingURL=routing.processor.js.map