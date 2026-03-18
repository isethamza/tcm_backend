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
exports.HandoverBatchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const handover_batch_service_1 = require("./handover-batch.service");
const auto_group_dto_1 = require("./dto/auto-group.dto");
const manual_create_batch_dto_1 = require("./dto/manual-create-batch.dto");
const add_parcels_dto_1 = require("./dto/add-parcels.dto");
let HandoverBatchController = class HandoverBatchController {
    constructor(service) {
        this.service = service;
    }
    autoGroup(req, dto) {
        return this.service.autoGroupAndAssign(req.user.id, dto.parcelIds);
    }
    createBatch(req, dto) {
        return this.service.createBatch(req.user.id, {
            type: dto.type,
            value: dto.value,
        });
    }
    addParcels(req, batchId, dto) {
        return this.service.addParcels(req.user.id, batchId, dto.parcelIds);
    }
    getBatch(req, id) {
        return this.service.getBatchById(req.user.id, id);
    }
    list(req) {
        return this.service.listBatches(req.user.id);
    }
};
exports.HandoverBatchController = HandoverBatchController;
__decorate([
    (0, common_1.Post)('auto-group'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto group parcels into batches' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batches created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auto_group_dto_1.AutoGroupBatchDto]),
    __metadata("design:returntype", void 0)
], HandoverBatchController.prototype, "autoGroup", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create empty batch manually' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Batch created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, manual_create_batch_dto_1.ManualCreateBatchDto]),
    __metadata("design:returntype", void 0)
], HandoverBatchController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Post)(':id/parcels'),
    (0, swagger_1.ApiOperation)({ summary: 'Add parcels to batch' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Batch ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parcels added' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_parcels_dto_1.AddParcelsToBatchDto]),
    __metadata("design:returntype", void 0)
], HandoverBatchController.prototype, "addParcels", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get batch details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Batch ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch retrieved' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HandoverBatchController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List batches for transporteur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batches list' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HandoverBatchController.prototype, "list", null);
exports.HandoverBatchController = HandoverBatchController = __decorate([
    (0, swagger_1.ApiTags)('Handover Batch'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transporteur/batches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR),
    __metadata("design:paramtypes", [handover_batch_service_1.HandoverBatchService])
], HandoverBatchController);
//# sourceMappingURL=handover-batch.controller.js.map