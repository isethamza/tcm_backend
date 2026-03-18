import { Worker, Job } from 'bullmq';
import { redisConnection } from '../infra/queue/queue.connection';
import {
  QUEUES,
  JOBS,
  QUEUE_CONCURRENCY,
  QUEUE_LIMITERS,
} from '../infra/queue/queue.constants';

import { prisma } from '../infra/prisma';
import { PickupRoutingQueue } from '../modules/pickup-routing/pickup-routing.queue';
import { AlertService } from '../infra/monitoring/alert.service';
import { jobCounter } from '../infra/monitoring/metrics.service';

type ExpireProposalJob = {
  proposalId: string;
};

// =====================================================
// WORKER FACTORY (Option A)
// =====================================================

export async function startProposalWorker(): Promise<Worker> {
  const worker = new Worker(
    QUEUES.PROPOSAL,
    async (job: Job<ExpireProposalJob>) => {
      const { proposalId } = job.data;

      console.log(`📦 ProposalWorker → ${job.name} | ${proposalId}`);

      try {
        switch (job.name) {
          case JOBS.PROPOSAL.EXPIRE:
            await handleExpireProposal(proposalId);
            break;

          default:
            console.warn(`⚠️ Unknown job: ${job.name}`);
        }
      } catch (err: any) {
        console.error(`❌ Proposal failed → ${job.name}`, err);
        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: QUEUE_CONCURRENCY[QUEUES.PROPOSAL],
      limiter: QUEUE_LIMITERS[QUEUES.PROPOSAL],
    },
  );

  // =====================================================
  // EVENTS
  // =====================================================

  worker.on('completed', () => {
    jobCounter.inc({ queue: QUEUES.PROPOSAL, status: 'completed' });
  });

  worker.on('failed', async (job, err) => {
    jobCounter.inc({ queue: QUEUES.PROPOSAL, status: 'failed' });

    await AlertService.sendCritical(
      `Proposal failed → ${job?.name}
ProposalId: ${job?.data?.proposalId}
Error: ${err?.message || err}`,
    );
  });

  worker.on('stalled', async jobId => {
    await AlertService.sendCritical(`⚠️ Proposal job stalled → ${jobId}`);
  });

  return worker;
}

// =====================================================
// HANDLER
// =====================================================

async function handleExpireProposal(proposalId: string) {
  if (!proposalId) throw new Error('Missing proposalId');

  const proposal = await prisma.schedulingProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    console.warn(`⚠️ Proposal not found → ${proposalId}`);
    return;
  }

  // ✅ Idempotency safeguard
  if (proposal.status !== 'PENDING') {
    console.log(`⏭️ Skipping (already processed) → ${proposalId}`);
    return;
  }

  console.log(`⏳ Expiring proposal → ${proposalId}`);

  await prisma.$transaction([
    prisma.schedulingProposal.update({
      where: { id: proposalId },
      data: { status: 'EXPIRED' },
    }),

    prisma.booking.update({
      where: { id: proposal.bookingId },
      data: {
        pickupLocked: false,
        pickupStatus: 'NOT_SCHEDULED',
      },
    }),
  ]);

  console.log(`🔓 Booking unlocked → ${proposal.bookingId}`);

  // 🚀 Trigger rerouting
  await PickupRoutingQueue.add(
    JOBS.PICKUP_ROUTING.RECOMPUTE,
    { bookingId: proposal.bookingId },
  );

  console.log(`🚚 Reroute triggered → ${proposal.bookingId}`);
}