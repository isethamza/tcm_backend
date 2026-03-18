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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard() {
        const users = await this.prisma.user.count();
        const trips = await this.prisma.trip.count({
            where: { status: 'PUBLISHED' },
        });
        const disputes = await this.prisma.dispute.count({
            where: { status: 'OPEN' },
        });
        const kycPending = await this.prisma.kyc.count({
            where: { status: 'PENDING' },
        });
        return { users, trips, disputes, kycPending };
    }
    async users() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async kyc() {
        return this.prisma.kyc.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async disputes() {
        return this.prisma.dispute.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async ledger() {
        return this.prisma.ledgerEntry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async tracking() {
        return this.prisma.trackingEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async sla() {
        const trips = await this.prisma.trip.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
        });
        return trips.map((t) => ({
            id: t.id,
            tripId: t.id,
            pickupDelay: 0,
            deliveryDelay: 0,
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map