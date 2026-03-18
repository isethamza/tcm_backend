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
exports.HandoverTokenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const handover_service_1 = require("./handover.service");
const crypto = require("crypto");
let HandoverTokenService = class HandoverTokenService {
    constructor(prisma, handoverService) {
        this.prisma = prisma;
        this.handoverService = handoverService;
    }
    async generateBatchToken(batchId, operatorId) {
        const token = crypto.randomUUID();
        return this.prisma.handoverToken.create({
            data: {
                token,
                batchId,
                createdById: operatorId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
    }
    async generateParcelToken(parcelId, operatorId) {
        const token = crypto.randomUUID();
        return this.prisma.handoverToken.create({
            data: {
                token,
                parcelId,
                createdById: operatorId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
    }
    async processScan(token, operatorId) {
        const record = await this.prisma.handoverToken.findUnique({
            where: { token },
        });
        if (!record)
            throw new common_1.NotFoundException('Invalid token');
        if (record.isUsed) {
            throw new common_1.BadRequestException('Token already used');
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token expired');
        }
        await this.prisma.handoverToken.update({
            where: { token },
            data: { isUsed: true },
        });
        if (record.batchId) {
            return this.handoverService.create({ batchId: record.batchId, toType: 'HUB_MANAGER' }, operatorId);
        }
        if (record.parcelId) {
            return this.handoverService.create({ parcelId: record.parcelId, toType: 'RECIPIENT' }, operatorId);
        }
        throw new common_1.BadRequestException('Invalid token scope');
    }
};
exports.HandoverTokenService = HandoverTokenService;
exports.HandoverTokenService = HandoverTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        handover_service_1.HandoverService])
], HandoverTokenService);
//# sourceMappingURL=handover-token.service.js.map