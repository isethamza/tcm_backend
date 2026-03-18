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
exports.HubController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hub_service_1 = require("./hub.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let HubController = class HubController {
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.createHub(req.user, dto);
    }
    findAvailable(dto) {
        return this.service.findAvailableHubs(dto);
    }
    reserve(dto) {
        return this.service.reserveCapacity(dto);
    }
    release(dto) {
        return this.service.releaseCapacity(dto);
    }
    utilization(id) {
        return this.service.getHubUtilization(id);
    }
};
exports.HubController = HubController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.HUB_MANAGER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a hub' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                name: 'Central Hub',
                location: 'Stockholm',
                capacity: 100,
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('available'),
    (0, swagger_1.ApiOperation)({ summary: 'Find available hubs' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                location: 'Stockholm',
                requiredCapacity: 10,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "findAvailable", null);
__decorate([
    (0, common_1.Post)('reserve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reserve hub capacity' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                hubId: 'uuid',
                amount: 5,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "reserve", null);
__decorate([
    (0, common_1.Post)('release'),
    (0, swagger_1.ApiOperation)({ summary: 'Release hub capacity' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                hubId: 'uuid',
                amount: 5,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "release", null);
__decorate([
    (0, common_1.Get)(':id/utilization'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get hub utilization (Admin only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "utilization", null);
exports.HubController = HubController = __decorate([
    (0, swagger_1.ApiTags)('Hubs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('hubs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hub_service_1.HubService])
], HubController);
//# sourceMappingURL=hub.controller.js.map