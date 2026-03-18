import { JobsOptions } from 'bullmq';

/**
 * =====================================================
 * 🎯 QUEUE NAMES (single source of truth)
 * =====================================================
 */
export const QUEUES = {
  MAIL: 'mail',
  PICKUP_ROUTING: 'pickup-routing',
  DELIVERY_ROUTING: 'delivery-routing',
  PROPOSAL: 'proposal',
  GEO: 'geo', // ✅ added
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/**
 * =====================================================
 * 📦 JOB NAMES (namespaced per queue)
 * =====================================================
 */
export const JOBS = {
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
    GEOCODE_BOOKING: 'geocode-booking', // ✅ already correct
  },
} as const;

/**
 * =====================================================
 * ⚙️ DEFAULT JOB OPTIONS (BullMQ)
 * =====================================================
 */
export const DEFAULT_JOB_OPTIONS: JobsOptions = { // ✅ FIXED typing
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

/**
 * =====================================================
 * 🚦 WORKER CONCURRENCY (per queue)
 * =====================================================
 */
export const QUEUE_CONCURRENCY: Record<QueueName, number> = {
  [QUEUES.MAIL]: 5,
  [QUEUES.PICKUP_ROUTING]: 5,
  [QUEUES.DELIVERY_ROUTING]: 5,
  [QUEUES.PROPOSAL]: 5,
  [QUEUES.GEO]: 10, // ✅ Geo tuned higher (good for I/O)
};

/**
 * =====================================================
 * ⏱ RATE LIMITERS (optional per queue)
 * =====================================================
 */
export const QUEUE_LIMITERS: Partial<
  Record<QueueName, { max: number; duration: number }>
> = {
  [QUEUES.MAIL]: {
    max: 10,
    duration: 1000,
  },

  [QUEUES.PICKUP_ROUTING]: {
    max: 5,
    duration: 1000,
  },

  [QUEUES.DELIVERY_ROUTING]: {
    max: 5,
    duration: 1000,
  },

  [QUEUES.GEO]: {
    max: 5, // ✅ protects geocoding API
    duration: 1000,
  },
};

/**
 * =====================================================
 * 🔁 PRIORITY LEVELS
 * =====================================================
 */
export const JOB_PRIORITY = {
  HIGH: 1,
  NORMAL: 5,
  LOW: 10,
} as const;

/**
 * =====================================================
 * 🌍 SUPPORTED LOCALES
 * =====================================================
 */
export const SUPPORTED_LOCALES = ['en', 'sv'] as const;

export type SupportedLocale =
  (typeof SUPPORTED_LOCALES)[number];

/**
 * =====================================================
 * 🔐 JOB ID BUILDER
 * =====================================================
 */
export function buildJobId(
  parts: (string | number | undefined | null)[],
) {
  return parts.filter(Boolean).join(':');
}

/**
 * =====================================================
 * 🧠 STANDARD JOB OPTIONS BUILDER
 * =====================================================
 */
export function getJobOptions(
  jobId?: string,
  overrides?: Partial<JobsOptions>,
): JobsOptions {
  return {
    ...DEFAULT_JOB_OPTIONS,
    ...(jobId ? { jobId } : {}),
    ...overrides,
  };
}