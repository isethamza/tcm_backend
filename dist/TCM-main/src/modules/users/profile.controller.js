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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const geo_service_1 = require("../../infra/geo.service");
let ProfileController = class ProfileController {
    constructor(prisma, geoService) {
        this.prisma = prisma;
        this.geoService = geoService;
    }
    async getMyProfile(req) {
        return this.prisma.profile.findUnique({
            where: { userId: req.user.id },
        });
    }
    async upsertProfile(req, dto) {
        const userId = req.user.id;
        let coords;
        try {
            coords = await this.geoService.geocode({
                address: dto.address,
                postalCode: dto.postalCode,
                city: dto.city,
                country: dto.country,
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid address. Could not determine location.');
        }
        if (coords.lat == null || coords.lng == null) {
            throw new common_1.BadRequestException('Failed to resolve coordinates');
        }
        return this.prisma.profile.upsert({
            where: { userId },
            create: {
                ...dto,
                lat: coords.lat,
                lng: coords.lng,
                user: {
                    connect: { id: userId },
                },
            },
            update: {
                ...dto,
                lat: coords.lat,
                lng: coords.lng,
            },
        });
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my profile' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update my profile' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                mobile: '+46700000000',
                address: 'Main Street 1',
                postalCode: '21120',
                city: 'Malmö',
                country: 'Sweden',
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "upsertProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, swagger_1.ApiTags)('Users Profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        geo_service_1.GeoService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map