// src/infra/redis.ts
// src/infra/redis.ts
import IORedis from 'ioredis';

export const redis = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  //url: process.env.REDIS_URL || 'redis://redis:6379',

});