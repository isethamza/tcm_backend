export const redisConnection = {
  host: process.env.REDIS_HOST ?? 'redis',
  port: Number(process.env.REDIS_PORT ?? 6379),
  //url: process.env.REDIS_URL ?? 'redis://redis:6379'

};