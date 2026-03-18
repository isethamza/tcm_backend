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
exports.TripStopController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tripstop_service_1 = require("./tripstop.service");
const create_tripstop_dto_1 = require("./dto/create-tripstop.dto");
const update_tripstop_dto_1 = require("./dto/update-tripstop.dto");
const activate_tripstop_dto_1 = require("./dto/activate-tripstop.dto");
const attach_tripstop_dto_1 = require("./dto/attach-tripstop.dto");
const reorder_tripstops_dto_1 = require("./dto/reorder-tripstops.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TripStopController = class TripStopController {
    constructor(service) {
        this.service = service;
    }
    create(dto, req) {
        return this.service.create(req.user.id, dto);
    }
    attach(stopId, dto, req) {
        return this.service.attach(req.user.id, stopId, dto.tripId);
    }
    activate(stopId, dto, req) {
        return this.service.activate(req.user.id, stopId, dto);
    }
    update(id, dto, req) {
        return this.service.update(req.user.id, id, dto);
    }
    reorder(tripId, dto, req) {
        return this.service.reorder(req.user.id, tripId, dto.stopIds);
    }
    list(req) {
        return this.service.listMyStops(req.user.id);
    }
    listTripStops(tripId, req) {
        return this.service.listTripStops(tripId);
    }
    delete(id, req) {
        return this.service.delete(req.user.id, id);
    }
};
exports.TripStopController = TripStopController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create trip stop (template or attached)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tripstop_dto_1.CreateTripStopDto, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/attach'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach stop to a trip (auto-order)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attach_tripstop_dto_1.AttachTripStopDto, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "attach", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate stop (address + schedule)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, activate_tripstop_dto_1.ActivateTripStopDto, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stop (locked if used)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tripstop_dto_1.UpdateTripStopDto, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('trip/:tripId/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder stops within a trip route' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_tripstops_dto_1.ReorderTripStopsDto, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my stops (templates + attached)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('trip/:tripId'),
    (0, swagger_1.ApiOperation)({ summary: 'List stops for a trip (ordered)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "listTripStops", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete stop (only if unused)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripStopController.prototype, "delete", null);
exports.TripStopController = TripStopController = __decorate([
    (0, swagger_1.ApiTags)('Trips'),
    (0, common_1.Controller)('transporteur/trip-stops'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR),
    __metadata("design:paramtypes", [tripstop_service_1.TripStopService])
], TripStopController);
//# sourceMappingURL=tripstop.controller.js.map