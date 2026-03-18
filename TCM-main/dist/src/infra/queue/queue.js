"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBullBoard = setupBullBoard;
const express_1 = require("@bull-board/express");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const pickup_routing_queue_1 = require("../../modules/pickup-routing/pickup-routing.queue");
const proposal_queue_1 = require("../../modules/pickup-scheduling/proposal/proposal.queue");
function setupBullBoard(app) {
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        queues: [
            new bullMQAdapter_1.BullMQAdapter(pickup_routing_queue_1.PickupRoutingQueue),
            new bullMQAdapter_1.BullMQAdapter(proposal_queue_1.proposalQueue),
        ],
        serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
}
//# sourceMappingURL=queue.js.map