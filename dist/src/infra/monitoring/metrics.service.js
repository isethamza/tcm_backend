"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobDuration = exports.jobCounter = void 0;
const prom_client_1 = require("prom-client");
exports.jobCounter = new prom_client_1.default.Counter({
    name: 'bullmq_jobs_total',
    help: 'Total jobs processed',
    labelNames: ['queue', 'status'],
});
exports.jobDuration = new prom_client_1.default.Histogram({
    name: 'bullmq_job_duration_seconds',
    help: 'Job duration',
    labelNames: ['queue'],
});
//# sourceMappingURL=metrics.service.js.map