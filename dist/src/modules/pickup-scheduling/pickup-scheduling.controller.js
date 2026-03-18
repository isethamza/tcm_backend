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
exports.PickupSchedulingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pickup_scheduling_service_1 = require("./pickup-scheduling.service");
let PickupSchedulingController = class PickupSchedulingController {
    constructor(service) {
        this.service = service;
    }
    async accept(proposalId) {
        return this.service.acceptProposal(proposalId);
    }
    async reject(proposalId) {
        return this.service.rejectProposal(proposalId);
    }
};
exports.PickupSchedulingController = PickupSchedulingController;
__decorate([
    (0, common_1.Post)('proposal/:proposalId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept pickup proposal' }),
    (0, swagger_1.ApiParam)({ name: 'proposalId', description: 'Proposal ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Proposal accepted',
    }),
    __param(0, (0, common_1.Param)('proposalId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PickupSchedulingController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)('proposal/:proposalId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject pickup proposal' }),
    (0, swagger_1.ApiParam)({ name: 'proposalId', description: 'Proposal ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Proposal rejected',
    }),
    __param(0, (0, common_1.Param)('proposalId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PickupSchedulingController.prototype, "reject", null);
exports.PickupSchedulingController = PickupSchedulingController = __decorate([
    (0, swagger_1.ApiTags)('Pickup Scheduling'),
    (0, common_1.Controller)('pickup-scheduling'),
    __metadata("design:paramtypes", [pickup_scheduling_service_1.PickupSchedulingService])
], PickupSchedulingController);
//# sourceMappingURL=pickup-scheduling.controller.js.map