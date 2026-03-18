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
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
let KycService = class KycService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async submit(userId, files) {
        if (!files || files.length < 2) {
            throw new common_1.BadRequestException('Missing documents');
        }
        const existing = await this.prisma.kyc.findFirst({
            where: { userId, status: client_1.KycStatus.PENDING },
        });
        if (existing) {
            throw new common_1.BadRequestException('KYC already submitted');
        }
        const [idDoc, selfie, license, insurance] = files;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const type = user.role === 'HUB_MANAGER'
            ? client_1.KycType.HUB_MANAGER
            : client_1.KycType.TRANSPORTEUR;
        return this.prisma.kyc.create({
            data: {
                userId,
                type,
                status: client_1.KycStatus.PENDING,
                idDocumentUrl: `/uploads/${idDoc.filename}`,
                selfieUrl: `/uploads/${selfie.filename}`,
                licenseUrl: license ? `/uploads/${license.filename}` : null,
                insuranceUrl: `/uploads/${insurance.filename}`,
            },
        });
    }
    findPending() {
        return this.prisma.kyc.findMany({
            where: {
                status: client_1.KycStatus.PENDING,
                type: { in: [client_1.KycType.TRANSPORTEUR, client_1.KycType.HUB_MANAGER] },
            },
            include: {
                user: { select: { id: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approve(kycId, adminId) {
        const kyc = await this.prisma.kyc.update({
            where: { id: kycId },
            data: {
                status: client_1.KycStatus.APPROVED,
                verifierId: adminId,
                verifiedAt: new Date(),
            },
        });
        await this.audit.log({
            actorId: adminId,
            action: 'KYC_APPROVED',
            entity: 'KYC',
            entityId: kycId,
            metadata: { userId: kyc.userId, type: kyc.type },
        });
        return kyc;
    }
    async reject(kycId, adminId, reason) {
        const kyc = await this.prisma.kyc.update({
            where: { id: kycId },
            data: {
                status: client_1.KycStatus.REJECTED,
                verifierId: adminId,
                verifiedAt: new Date(),
                rejectionReason: reason,
            },
        });
        await this.audit.log({
            actorId: adminId,
            action: 'KYC_REJECTED',
            entity: 'KYC',
            entityId: kycId,
            metadata: { reason, userId: kyc.userId, type: kyc.type },
        });
        return kyc;
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], KycService);
//# sourceMappingURL=kyc.service.js.map