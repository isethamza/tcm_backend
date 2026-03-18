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
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trips_service_1 = require("./trips.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const kyc_approved_guard_1 = require("../kyc/kyc-approved.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const update_trip_dto_1 = require("./dto/update-trip.dto");
let TripsController = class TripsController {
    constructor(tripsService) {
        this.tripsService = tripsService;
    }
    createTrip(req, dto) {
        return this.tripsService.create(dto, req.user.id, req.user.role);
    }
    myTrips(req) {
        return this.tripsService.myTrips(req.user.id);
    }
    search(from, to, date) {
        return this.tripsService.search({ from, to, date });
    }
    searchByCountryCity(q) {
        return this.tripsService.searchAdvanced({
            fromCountry: q.fromCountry,
            fromCity: q.fromCity,
            toCountry: q.toCountry,
            toCity: q.toCity,
            date: q.date,
            maxPriceKg: q.maxPriceKg ? Number(q.maxPriceKg) : undefined,
        });
    }
    getTrip(id, req) {
        return this.tripsService.getTripById(id, req.user.id);
    }
    publish(id, req) {
        return this.tripsService.publish(id, req.user.id);
    }
    putBackToDraft(id, req) {
        return this.tripsService.putBackToDraft(id, req.user.id);
    }
    hold(id, req) {
        return this.tripsService.hold(id, req.user.id);
    }
    resume(id, req) {
        return this.tripsService.resume(id, req.user.id);
    }
    delay(id, newDate, req) {
        return this.tripsService.delay(id, newDate, req.user.id);
    }
    updateTrip(id, dto, req) {
        return this.tripsService.updateTrip(id, req.user.id, dto);
    }
    cancelTrip(id, req) {
        return this.tripsService.cancelTrip(id, req.user.id);
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(kyc_approved_guard_1.KycApprovedGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create trip (KYC required)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "createTrip", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my trips' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "myTrips", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search trips (public)' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('searchByCountryCity'),
    (0, roles_decorator_1.Roles)(),
    (0, swagger_1.ApiOperation)({ summary: 'Advanced trip search' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "searchByCountryCity", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trip by ID (owner only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "getTrip", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish trip' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Move trip to draft' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "putBackToDraft", null);
__decorate([
    (0, common_1.Post)(':id/hold'),
    (0, swagger_1.ApiOperation)({ summary: 'Hold trip' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "hold", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Resume trip' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/delay'),
    (0, swagger_1.ApiOperation)({ summary: 'Delay trip' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                newDepartureDate: '2026-03-01T10:00:00Z',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('newDepartureDate')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "delay", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update trip (owner only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_trip_dto_1.UpdateTripDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "updateTrip", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel trip' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "cancelTrip", null);
exports.TripsController = TripsController = __decorate([
    (0, swagger_1.ApiTags)('Trips'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transporteur/trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRANSPORTEUR),
    __metadata("design:paramtypes", [trips_service_1.TripsService])
], TripsController);
//# sourceMappingURL=trips.controller.js.map