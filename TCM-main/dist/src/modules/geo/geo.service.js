"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
const node_fetch_1 = require("node-fetch");
let GeoService = class GeoService {
    constructor() {
        this.token = process.env.MAPBOX_TOKEN;
        if (!this.token) {
            throw new Error('MAPBOX_TOKEN not set');
        }
    }
    async geocode(dto) {
        const query = [
            dto.address,
            dto.postalCode,
            dto.city,
            dto.country,
        ]
            .filter(Boolean)
            .join(', ');
        return this.geocodeQuery(query);
    }
    async geocodeAddress(address) {
        if (!address) {
            throw new common_1.BadRequestException('Missing address');
        }
        return this.geocodeQuery(address);
    }
    async geocodeQuery(query) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.token}&limit=1`;
            const res = await (0, node_fetch_1.default)(url, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) {
                throw new Error(`Mapbox error: ${res.status}`);
            }
            const data = await res.json();
            if (!data.features?.length) {
                throw new common_1.BadRequestException(`Geocoding failed for: ${query}`);
            }
            const [lng, lat] = data.features[0].center;
            return {
                lat: Number(lat.toFixed(6)),
                lng: Number(lng.toFixed(6)),
            };
        }
        catch (err) {
            if (err.name === 'AbortError') {
                throw new common_1.InternalServerErrorException('Geocoding timeout');
            }
            console.error('❌ Mapbox geocode error:', err.message);
            throw new common_1.InternalServerErrorException('Geocoding service failed');
        }
    }
};
exports.GeoService = GeoService;
exports.GeoService = GeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeoService);
//# sourceMappingURL=geo.service.js.map