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
exports.KycApprovedGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let KycApprovedGuard = class KycApprovedGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user) {
            throw new common_1.ForbiddenException('Not authenticated');
        }
        if (!['TRANSPORTEUR', 'HUB_MANAGER'].includes(user.role)) {
            return true;
        }
        const approvedKyc = await this.prisma.kyc.findFirst({
            where: {
                userId: user.id,
                status: client_1.KycStatus.APPROVED,
            },
        });
        if (!approvedKyc) {
            throw new common_1.ForbiddenException('KYC approval required before performing this action');
        }
        return true;
    }
};
exports.KycApprovedGuard = KycApprovedGuard;
exports.KycApprovedGuard = KycApprovedGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KycApprovedGuard);
//# sourceMappingURL=kyc-approved.guard.js.map