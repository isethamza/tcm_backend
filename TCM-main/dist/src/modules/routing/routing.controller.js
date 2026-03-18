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
exports.PickupRoutingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let PickupRoutingController = class PickupRoutingController {
    async solvePreview(body) {
        const res = await fetch(process.env.ROUTING_API_URL || 'http://127.0.0.1:8000/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
            throw new Error(`Solver failed: ${res.status}`);
        }
        const data = await res.json();
        return {
            success: true,
            solver: data,
        };
    }
};
exports.PickupRoutingController = PickupRoutingController;
__decorate([
    (0, common_1.Post)('debug/solve-preview'),
    (0, swagger_1.ApiOperation)({
        summary: 'Preview pickup routing solver',
        description: 'Calls Python routing solver (DEBUG ONLY)',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Route result from solver',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PickupRoutingController.prototype, "solvePreview", null);
exports.PickupRoutingController = PickupRoutingController = __decorate([
    (0, swagger_1.ApiTags)('Pickup Routing - Solver Debug'),
    (0, common_1.Controller)('pickup-routing')
], PickupRoutingController);
//# sourceMappingURL=routing.controller.js.map