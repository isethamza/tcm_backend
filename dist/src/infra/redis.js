"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
});
//# sourceMappingURL=redis.js.map