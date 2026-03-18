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
exports.HandoverController = void 0;
const common_1 = require("@nestjs/common");
const handover_service_1 = require("./handover.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const create_handover_dto_1 = require("./dto/create-handover.dto");
const accept_handover_dto_1 = require("./dto/accept-handover.dto");
const swagger_1 = require("@nestjs/swagger");
let HandoverController = class HandoverController {
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(dto, req.user.id);
    }
    accept(req, id, dto) {
        return this.service.accept(id, req.user.id, dto.accept);
    }
    getByBooking(bookingId) {
        return this.service.getByBooking(bookingId);
    }
};
exports.HandoverController = HandoverController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR, client_1.UserRole.HUB_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create handover event (batch or parcel)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Handover created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_handover_dto_1.CreateHandoverDto]),
    __metadata("design:returntype", void 0)
], HandoverController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR, client_1.UserRole.HUB_MANAGER, client_1.UserRole.RECIPIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Accept or reject handover' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Handover ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Handover processed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, accept_handover_dto_1.AcceptHandoverDto]),
    __metadata("design:returntype", void 0)
], HandoverController.prototype, "accept", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR, client_1.UserRole.HUB_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get handover chain for booking' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Handover list' }),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HandoverController.prototype, "getByBooking", null);
exports.HandoverController = HandoverController = __decorate([
    (0, swagger_1.ApiTags)('Handover'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transporteur/handover'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [handover_service_1.HandoverService])
], HandoverController);
//# sourceMappingURL=handover.controller.js.map