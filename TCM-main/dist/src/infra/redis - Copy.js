"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST ?? 'redis',
    port: 6379,
});
//# sourceMappingURL=redis%20-%20Copy.js.map