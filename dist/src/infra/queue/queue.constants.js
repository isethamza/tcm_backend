"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LOCALES = exports.JOB_PRIORITY = exports.QUEUE_LIMITERS = exports.QUEUE_CONCURRENCY = exports.DEFAULT_JOB_OPTIONS = exports.JOBS = exports.QUEUES = void 0;
exports.buildJobId = buildJobId;
exports.getJobOptions = getJobOptions;
exports.QUEUES = {
    MAIL: 'mail',
    PICKUP_ROUTING: 'pickup-routing',
    DELIVERY_ROUTING: 'delivery-routing',
    PROPOSAL: 'proposal',
    GEO: 'geo',
};
exports.JOBS = {
    MAIL: {
        SEND: 'send-mail',
    },
    PICKUP_ROUTING: {
        COMPUTE: 'compute-pickup-route',
        RECOMPUTE: 'recompute-pickup-route',
    },
    DELIVERY_ROUTING: {
        COMPUTE: 'compute-delivery-route',
        RECOMPUTE: 'recompute-delivery-route',
    },
    PROPOSAL: {
        GENERATE: 'generate-proposal',
        EXPIRE: 'expire-proposal',
    },
    GEO: {
        GEOCODE_BOOKING: 'geocode-booking',
    },
};
exports.DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
};
exports.QUEUE_CONCURRENCY = {
    [exports.QUEUES.MAIL]: 5,
    [exports.QUEUES.PICKUP_ROUTING]: 5,
    [exports.QUEUES.DELIVERY_ROUTING]: 5,
    [exports.QUEUES.PROPOSAL]: 5,
    [exports.QUEUES.GEO]: 10,
};
exports.QUEUE_LIMITERS = {
    [exports.QUEUES.MAIL]: {
        max: 10,
        duration: 1000,
    },
    [exports.QUEUES.PICKUP_ROUTING]: {
        max: 5,
        duration: 1000,
    },
    [exports.QUEUES.DELIVERY_ROUTING]: {
        max: 5,
        duration: 1000,
    },
    [exports.QUEUES.GEO]: {
        max: 5,
        duration: 1000,
    },
};
exports.JOB_PRIORITY = {
    HIGH: 1,
    NORMAL: 5,
    LOW: 10,
};
exports.SUPPORTED_LOCALES = ['en', 'sv'];
function buildJobId(parts) {
    return parts.filter(Boolean).join(':');
}
function getJobOptions(jobId, overrides) {
    return {
        ...exports.DEFAULT_JOB_OPTIONS,
        ...(jobId ? { jobId } : {}),
        ...overrides,
    };
}
//# sourceMappingURL=queue.constants.js.map