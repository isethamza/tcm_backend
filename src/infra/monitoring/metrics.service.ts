import client from 'prom-client';

export const jobCounter = new client.Counter({
  name: 'bullmq_jobs_total',
  help: 'Total jobs processed',
  labelNames: ['queue', 'status'],
});

export const jobDuration = new client.Histogram({
  name: 'bullmq_job_duration_seconds',
  help: 'Job duration',
  labelNames: ['queue'],
});