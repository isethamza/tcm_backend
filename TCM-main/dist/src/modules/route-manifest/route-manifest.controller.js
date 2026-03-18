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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteManifestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const route_manifest_service_1 = require("./route-manifest.service");
let RouteManifestController = class RouteManifestController {
    constructor(service) {
        this.service = service;
    }
    getManifest(tripId) {
        return this.service.getTripManifest(tripId);
    }
};
exports.RouteManifestController = RouteManifestController;
__decorate([
    (0, common_1.Get)(':tripId/manifest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trip delivery route manifest' }),
    (0, swagger_1.ApiParam)({
        name: 'tripId',
        type: String,
        description: 'Trip ID (UUID)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Delivery Route manifest retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('tripId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RouteManifestController.prototype, "getManifest", null);
exports.RouteManifestController = RouteManifestController = __decorate([
    (0, swagger_1.ApiTags)('Delivery Routes'),
    (0, common_1.Controller)('routes'),
    __metadata("design:paramtypes", [route_manifest_service_1.RouteManifestService])
], RouteManifestController);
//# sourceMappingURL=route-manifest.controller.js.map