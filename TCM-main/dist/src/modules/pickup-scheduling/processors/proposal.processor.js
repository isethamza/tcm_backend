"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
const client_1 = require("@prisma/client");
const routing_queue_1 = require("../queues/routing.queue");
const prisma = new client_1.PrismaClient();
new bullmq_1.Worker('proposal', async (job) => {
    const { proposalId } = job.data;
    const proposal = await prisma.schedulingProposal.findUnique({
        where: { id: proposalId },
        include: { booking: true },
    });
    if (!proposal)
        return;
    if (proposal.status !== 'PENDING')
        return;
    await prisma.schedulingProposal.update({
        where: { id: proposalId },
        data: { status: 'EXPIRED' },
    });
    await prisma.booking.update({
        where: { id: proposal.bookingId },
        data: {
            pickupLocked: false,
            pickupStatus: 'NOT_SCHEDULED',
        },
    });
    await routing_queue_1.routingQueue.add('reroute-booking', {
        bookingId: proposal.bookingId,
    });
}, { connection: redis_1.redis });
//# sourceMappingURL=proposal.processor.js.map