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
exports.PickupController = void 0;
const common_1 = require("@nestjs/common");
const pickup_service_1 = require("./pickup.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const scan_pickup_dto_1 = require("./dto/scan-pickup.dto");
const verify_artifact_dto_1 = require("./dto/verify-artifact.dto");
const update_parcel_dto_1 = require("./dto/update-parcel.dto");
const complete_pickup_dto_1 = require("./dto/complete-pickup.dto");
const swagger_1 = require("@nestjs/swagger");
let PickupController = class PickupController {
    constructor(service) {
        this.service = service;
    }
    getPickup(req, pickupId) {
        return this.service.getPickup(pickupId, req.user.id);
    }
    scan(req, dto) {
        return this.service.startPickup(dto.bookingId, req.user.id);
    }
    addArtifact(req, pickupId, dto) {
        return this.service.addArtifact(pickupId, req.user.id, dto);
    }
    confirmParcels(req, pickupId, dto) {
        return this.service.confirmParcels(pickupId, req.user.id, dto.parcels);
    }
    completePickup(req, pickupId, dto) {
        return this.service.completePickup(pickupId, req.user.id, dto);
    }
};
exports.PickupController = PickupController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pickup session details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pickup session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pickup not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PickupController.prototype, "getPickup", null);
__decorate([
    (0, common_1.Post)('scan'),
    (0, swagger_1.ApiOperation)({
        summary: 'Scan booking QR and start pickup session',
    }),
    (0, swagger_1.ApiBody)({ type: scan_pickup_dto_1.ScanPickupDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup started' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid booking' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scan_pickup_dto_1.ScanPickupDto]),
    __metadata("design:returntype", void 0)
], PickupController.prototype, "scan", null);
__decorate([
    (0, common_1.Post)(':id/artifacts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload verification artifact (identity / parcel)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pickup session ID' }),
    (0, swagger_1.ApiBody)({ type: verify_artifact_dto_1.VerifyArtifactDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Artifact added' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid artifact' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, verify_artifact_dto_1.VerifyArtifactDto]),
    __metadata("design:returntype", void 0)
], PickupController.prototype, "addArtifact", null);
__decorate([
    (0, common_1.Post)(':id/parcels'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm parcels (VERIFIED / MISSING / DAMAGED)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pickup session ID' }),
    (0, swagger_1.ApiBody)({ type: update_parcel_dto_1.UpdateParcelDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parcels processed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parcels' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_parcel_dto_1.UpdateParcelDto]),
    __metadata("design:returntype", void 0)
], PickupController.prototype, "confirmParcels", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete pickup and collect cash (if applicable)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pickup session ID' }),
    (0, swagger_1.ApiBody)({ type: complete_pickup_dto_1.CompletePickupDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, complete_pickup_dto_1.CompletePickupDto]),
    __metadata("design:returntype", void 0)
], PickupController.prototype, "completePickup", null);
exports.PickupController = PickupController = __decorate([
    (0, swagger_1.ApiTags)('Transporteur Pickup'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transporteur/pickups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR),
    __metadata("design:paramtypes", [pickup_service_1.PickupService])
], PickupController);
//# sourceMappingURL=pickup.controller.js.map