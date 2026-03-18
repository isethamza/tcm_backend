"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBullBoard = setupBullBoard;
const express_1 = require("@bull-board/express");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const mail_queue_1 = require("./mail.queue");
const queue_auth_middleware_1 = require("./queue-auth.middleware");
const pickup_routing_queue_1 = require("../../modules/pickup-routing/pickup-routing.queue");
const proposal_queue_1 = require("../../modules/pickup-scheduling/proposal/proposal.queue");
const geo_queue_1 = require("../../modules/geo/geo.queue");
function setupBullBoard(app) {
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    const queues = [
        mail_queue_1.mailQueue,
        pickup_routing_queue_1.PickupRoutingQueue,
        proposal_queue_1.proposalQueue,
        geo_queue_1.geoQueue,
    ];
    (0, api_1.createBullBoard)({
        queues: queues.map(q => new bullMQAdapter_1.BullMQAdapter(q)),
        serverAdapter,
    });
    app.use('/admin/queues', queue_auth_middleware_1.bullBoardAuthMiddleware, serverAdapter.getRouter());
}
//# sourceMappingURL=queue.dashboard.js.map