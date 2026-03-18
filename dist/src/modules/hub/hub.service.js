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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HubService = class HubService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateVolumeM3(lengthCm, widthCm, heightCm) {
        return (lengthCm / 100) * (widthCm / 100) * (heightCm / 100);
    }
    async createHub(user, dto) {
        if (user.role !== client_1.UserRole.HUB_MANAGER &&
            user.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException();
        }
        return this.prisma.hub.create({
            data: {
                name: dto.name,
                country: dto.country,
                city: dto.city,
                address: dto.address,
                postalCode: dto.postalCode,
                type: dto.type,
                maxParcelWeightKg: dto.maxParcelWeightKg,
                maxParcelVolumeM3: dto.maxParcelVolumeM3,
                managerId: user.role === 'HUB_MANAGER' ? user.id : undefined,
                status: user.role === 'ADMIN' ? 'ACTIVE' : 'DRAFT',
                openingHours: {
                    create: dto.openingHours,
                },
            },
            include: { openingHours: true },
        });
    }
    async findAvailableHubs(dto) {
        const volume = this.calculateVolumeM3(dto.lengthCm, dto.widthCm, dto.heightCm);
        const hubs = await this.prisma.hub.findMany({
            where: {
                country: dto.country,
                city: dto.city,
                status: client_1.HubStatus.ACTIVE,
            },
            include: { openingHours: true },
        });
        return hubs.filter((hub) => {
            return (hub.occupiedWeightKg + dto.weightKg <=
                hub.maxParcelWeightKg &&
                hub.occupiedVolumeM3 + volume <=
                    hub.maxParcelVolumeM3);
        });
    }
    async reserveCapacity(dto) {
        const volume = this.calculateVolumeM3(dto.lengthCm, dto.widthCm, dto.heightCm);
        return this.prisma.$transaction(async (tx) => {
            const hub = await tx.hub.findUnique({
                where: { id: dto.hubId },
            });
            if (!hub)
                throw new common_1.NotFoundException('Hub not found');
            if (hub.status !== client_1.HubStatus.ACTIVE) {
                throw new common_1.BadRequestException('Hub not active');
            }
            if (hub.occupiedWeightKg + dto.weightKg >
                hub.maxParcelWeightKg) {
                throw new common_1.BadRequestException('Hub weight capacity exceeded');
            }
            if (hub.occupiedVolumeM3 + volume >
                hub.maxParcelVolumeM3) {
                throw new common_1.BadRequestException('Hub volume capacity exceeded');
            }
            return tx.hub.update({
                where: { id: dto.hubId },
                data: {
                    occupiedWeightKg: hub.occupiedWeightKg + dto.weightKg,
                    occupiedVolumeM3: hub.occupiedVolumeM3 + volume,
                },
            });
        });
    }
    async releaseCapacity(dto) {
        const volume = this.calculateVolumeM3(dto.lengthCm, dto.widthCm, dto.heightCm);
        return this.prisma.hub.update({
            where: { id: dto.hubId },
            data: {
                occupiedWeightKg: {
                    decrement: dto.weightKg,
                },
                occupiedVolumeM3: {
                    decrement: volume,
                },
            },
        });
    }
    async validateHubOpen(hubId, date) {
        const day = date
            .toLocaleString('en-US', { weekday: 'long' })
            .toUpperCase();
        const schedule = await this.prisma.hubOpeningHours.findFirst({
            where: {
                hubId,
                day: day,
            },
        });
        if (!schedule || schedule.isClosed) {
            throw new common_1.BadRequestException('Hub closed on this day');
        }
        const time = date.toTimeString().slice(0, 5);
        if (time < schedule.openTime ||
            time > schedule.closeTime) {
            throw new common_1.BadRequestException('Hub closed at this time');
        }
    }
    async getHubUtilization(hubId) {
        const hub = await this.prisma.hub.findUnique({
            where: { id: hubId },
        });
        if (!hub) {
            throw new common_1.NotFoundException('Hub not found');
        }
        return {
            weightUtilizationPercent: (hub.occupiedWeightKg /
                hub.maxParcelWeightKg) *
                100,
            volumeUtilizationPercent: (hub.occupiedVolumeM3 /
                hub.maxParcelVolumeM3) *
                100,
            availableWeightKg: hub.maxParcelWeightKg -
                hub.occupiedWeightKg,
            availableVolumeM3: hub.maxParcelVolumeM3 -
                hub.occupiedVolumeM3,
        };
    }
};
exports.HubService = HubService;
exports.HubService = HubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HubService);
//# sourceMappingURL=hub.service.js.map