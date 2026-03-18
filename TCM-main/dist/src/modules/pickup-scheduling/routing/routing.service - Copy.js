"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../infra/redis");
exports.proposalQueue = new bullmq_1.Queue('proposal', {
    connection: redis_1.redis,
});
//# sourceMappingURL=routing.service%20-%20Copy.js.map