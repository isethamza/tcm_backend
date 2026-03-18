import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { mailQueue } from './mail.queue';
import { bullBoardAuthMiddleware } from './queue-auth.middleware';

// module queues (current structure)
import { PickupRoutingQueue } from '../../modules/pickup-routing/pickup-routing.queue';
import { proposalQueue } from '../../modules/pickup-scheduling/proposal/proposal.queue';

// ✅ ADD THIS
import { geoQueue } from '../../modules/geo/geo.queue'; // adjust path if needed

export function setupBullBoard(app: any) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const queues = [
    mailQueue,
    PickupRoutingQueue,
    proposalQueue,
    geoQueue, // ✅ now visible
  ];

  createBullBoard({
    queues: queues.map(q => new BullMQAdapter(q)),
    serverAdapter,
  });

  app.use(
    '/admin/queues',
    bullBoardAuthMiddleware,
    serverAdapter.getRouter(),
  );
}