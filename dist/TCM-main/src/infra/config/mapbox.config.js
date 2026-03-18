"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapboxConfig = void 0;
exports.mapboxConfig = {
    token: process.env.MAPBOX_TOKEN,
    rateLimit: {
        max: Number(process.env.MAPBOX_RATE_LIMIT_MAX ?? 60),
        duration: Number(process.env.MAPBOX_RATE_LIMIT_DURATION ?? 60000),
    },
    minInterval: Number(process.env.MAPBOX_MIN_INTERVAL ?? 0),
};
//# sourceMappingURL=mapbox.config.js.map