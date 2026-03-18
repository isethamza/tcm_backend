"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
const client_1 = require("@prisma/client");
const node_fetch_1 = require("node-fetch");
const prisma = new client_1.PrismaClient();
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
new bullmq_1.Worker('routing', async (job) => {
    const { bookingId } = job.data;
    const triggerBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!triggerBooking)
        return;
    const bookings = await prisma.booking.findMany({
        where: {
            tripId: triggerBooking.tripId,
            pickupLocked: false,
            pickupOption: {
                in: [
                    client_1.PickupOption.STANDARD_HOME_PICKUP,
                    client_1.PickupOption.ADVANCED_HOME_PICKUP,
                ],
            },
        },
    });
    if (!bookings.length)
        return;
    const depot = { lat: 55.6, lng: 13.0 };
    const points = [
        depot,
        ...bookings.map(b => ({
            id: b.id,
            lat: b.pickupLat,
            lng: b.pickupLng,
        })),
    ];
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    const matrixRes = await (0, node_fetch_1.default)(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}?annotations=duration&access_token=${MAPBOX_TOKEN}`);
    const matrixData = await matrixRes.json();
    const matrix = matrixData.durations.map((row) => row.map(v => Math.round(v / 60)));
    const solverRes = await (0, node_fetch_1.default)('http://localhost:8000/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix }),
    });
    const route = await solverRes.json();
    let currentTime = new Date();
    currentTime.setHours(7, 0, 0, 0);
    const routeStops = [];
    for (let i = 1; i < route.length; i++) {
        const from = route[i - 1];
        const to = route[i];
        const travel = matrix[from][to];
        currentTime = new Date(currentTime.getTime() + travel * 60000);
        const eta = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + 10 * 60000);
        const point = points[to];
        if (!point || !('id' in point) || !point.id)
            continue;
        routeStops.push({
            bookingId: point.id,
            eta,
            order: i,
        });
    }
    if (!routeStops.length)
        return;
    const slots = [];
    let currentSlot = [];
    let start = routeStops[0].eta;
    for (const stop of routeStops) {
        const diff = (stop.eta.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (diff <= 6) {
            currentSlot.push(stop);
        }
        else {
            slots.push({
                start,
                end: currentSlot[currentSlot.length - 1].eta,
                stops: currentSlot,
            });
            currentSlot = [stop];
            start = stop.eta;
        }
    }
    if (currentSlot.length) {
        slots.push({
            start,
            end: currentSlot[currentSlot.length - 1].eta,
            stops: currentSlot,
        });
    }
    await prisma.$transaction(async (tx) => {
        await tx.routeStop.deleteMany({
            where: { tripId: triggerBooking.tripId },
        });
        for (const stop of routeStops) {
            await tx.routeStop.create({
                data: {
                    tripId: triggerBooking.tripId,
                    bookingId: stop.bookingId,
                    order: stop.order,
                    eta: stop.eta,
                },
            });
        }
        for (const slot of slots) {
            for (const stop of slot.stops) {
                await tx.booking.update({
                    where: { id: stop.bookingId },
                    data: {
                        estimatedArrival: stop.eta,
                        routeOrder: stop.order,
                        pickupStart: slot.start,
                        pickupEnd: slot.end,
                        pickupStatus: client_1.PickupStatus.ROUTED,
                    },
                });
            }
        }
    });
    for (const stop of routeStops) {
        const b = bookings.find(x => x.id === stop.bookingId);
        if (!b)
            continue;
        if (b.pickupOption === client_1.PickupOption.ADVANCED_HOME_PICKUP) {
            await prisma.schedulingProposal.create({
                data: {
                    bookingId: b.id,
                    startTime: b.pickupStart,
                    endTime: b.pickupEnd,
                },
            });
        }
        else {
            await prisma.booking.update({
                where: { id: b.id },
                data: {
                    pickupLocked: true,
                    pickupStatus: client_1.PickupStatus.SCHEDULED,
                },
            });
        }
    }
}, {
    connection: redis_1.redis,
    concurrency: 5,
});
//# sourceMappingURL=routing.worker.js.map