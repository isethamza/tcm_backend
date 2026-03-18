"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startProposalWorker = startProposalWorker;
const bullmq_1 = require("bullmq");
const queue_connection_1 = require("../infra/queue/queue.connection");
const queue_constants_1 = require("../infra/queue/queue.constants");
const prisma_1 = require("../infra/prisma");
const pickup_routing_queue_1 = require("../modules/pickup-routing/pickup-routing.queue");
const alert_service_1 = require("../infra/monitoring/alert.service");
const metrics_service_1 = require("../infra/monitoring/metrics.service");
async function startProposalWorker() {
    const worker = new bullmq_1.Worker(queue_constants_1.QUEUES.PROPOSAL, async (job) => {
        const { proposalId } = job.data;
        console.log(`📦 ProposalWorker → ${job.name} | ${proposalId}`);
        try {
            switch (job.name) {
                case queue_constants_1.JOBS.PROPOSAL.EXPIRE:
                    await handleExpireProposal(proposalId);
                    break;
                default:
                    console.warn(`⚠️ Unknown job: ${job.name}`);
            }
        }
        catch (err) {
            console.error(`❌ Proposal failed → ${job.name}`, err);
            throw err;
        }
    }, {
        connection: queue_connection_1.redisConnection,
        concurrency: queue_constants_1.QUEUE_CONCURRENCY[queue_constants_1.QUEUES.PROPOSAL],
        limiter: queue_constants_1.QUEUE_LIMITERS[queue_constants_1.QUEUES.PROPOSAL],
    });
    worker.on('completed', () => {
        metrics_service_1.jobCounter.inc({ queue: queue_constants_1.QUEUES.PROPOSAL, status: 'completed' });
    });
    worker.on('failed', async (job, err) => {
        metrics_service_1.jobCounter.inc({ queue: queue_constants_1.QUEUES.PROPOSAL, status: 'failed' });
        await alert_service_1.AlertService.sendCritical(`Proposal failed → ${job?.name}
ProposalId: ${job?.data?.proposalId}
Error: ${err?.message || err}`);
    });
    worker.on('stalled', async (jobId) => {
        await alert_service_1.AlertService.sendCritical(`⚠️ Proposal job stalled → ${jobId}`);
    });
    return worker;
}
async function handleExpireProposal(proposalId) {
    if (!proposalId)
        throw new Error('Missing proposalId');
    const proposal = await prisma_1.prisma.schedulingProposal.findUnique({
        where: { id: proposalId },
    });
    if (!proposal) {
        console.warn(`⚠️ Proposal not found → ${proposalId}`);
        return;
    }
    if (proposal.status !== 'PENDING') {
        console.log(`⏭️ Skipping (already processed) → ${proposalId}`);
        return;
    }
    console.log(`⏳ Expiring proposal → ${proposalId}`);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.schedulingProposal.update({
            where: { id: proposalId },
            data: { status: 'EXPIRED' },
        }),
        prisma_1.prisma.booking.update({
            where: { id: proposal.bookingId },
            data: {
                pickupLocked: false,
                pickupStatus: 'NOT_SCHEDULED',
            },
        }),
    ]);
    console.log(`🔓 Booking unlocked → ${proposal.bookingId}`);
    await pickup_routing_queue_1.PickupRoutingQueue.add(queue_constants_1.JOBS.PICKUP_ROUTING.RECOMPUTE, { bookingId: proposal.bookingId });
    console.log(`🚚 Reroute triggered → ${proposal.bookingId}`);
}
//# sourceMappingURL=proposal.worker.js.map