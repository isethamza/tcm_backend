"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workers = [];
function registerWorker(worker) {
    workers.push(worker);
}
async function startWorkers() {
    try {
        const pickupRouting = await Promise.resolve().then(() => require('./pickup-routing.worker'));
        const proposal = await Promise.resolve().then(() => require('./proposal.worker'));
        const mail = await Promise.resolve().then(() => require('./mail.worker'));
        const deliveryRouting = await Promise.resolve().then(() => require('./delivery-routing.worker'));
        if (pickupRouting.startPickupRoutingWorker) {
            const worker = await pickupRouting.startPickupRoutingWorker();
            registerWorker(worker);
        }
        if (proposal.startProposalWorker) {
            const worker = await proposal.startProposalWorker();
            registerWorker(worker);
        }
        if (mail.startMailWorker) {
            const worker = await mail.startMailWorker();
            registerWorker(worker);
        }
        if (deliveryRouting.startDeliveryRoutingWorker) {
            const worker = await deliveryRouting.startDeliveryRoutingWorker();
            registerWorker(worker);
        }
        console.log(`🚀 Workers started (${workers.length}): ${workers
            .map(w => w.name)
            .join(', ')}`);
    }
    catch (err) {
        console.error('❌ Failed to load workers', err);
        process.exit(1);
    }
}
process.on('uncaughtException', err => {
    console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('💥 Unhandled Rejection:', err);
});
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
async function shutdown() {
    console.log('🛑 Shutting down workers...');
    try {
        await Promise.all(workers.map(w => w.close().catch(err => console.error(`❌ Error closing worker`, err))));
    }
    catch (err) {
        console.error('Shutdown error:', err);
    }
    console.log('✅ Workers stopped');
    process.exit(0);
}
startWorkers();
//# sourceMappingURL=index.js.map