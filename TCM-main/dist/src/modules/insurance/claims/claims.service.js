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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const claims_policy_1 = require("./claims.policy");
const insurance_mapper_1 = require("../mappers/insurance.mapper");
let ClaimsService = class ClaimsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitClaim(dto) {
        const insurance = await this.prisma.bookingInsurance.findUnique({
            where: { id: dto.insuranceId },
            include: { claims: true },
        });
        if (!insurance) {
            throw new common_1.NotFoundException('Insurance not found');
        }
        claims_policy_1.ClaimsPolicy.validateClaimCreation(insurance, dto.claimedAmount);
        return this.prisma.$transaction(async (tx) => {
            const claim = await tx.insuranceClaim.create({
                data: {
                    insuranceId: dto.insuranceId,
                    reason: dto.reason,
                    description: dto.description,
                    evidenceUrls: dto.evidenceUrls,
                    claimedAmount: dto.claimedAmount,
                    status: client_1.InsuranceClaimStatus.SUBMITTED,
                },
            });
            await tx.bookingInsurance.update({
                where: { id: dto.insuranceId },
                data: { status: client_1.InsuranceStatus.CLAIMED },
            });
            return insurance_mapper_1.InsuranceMapper.toClaimResponse(claim);
        });
    }
    async updateStatus(id, dto) {
        const claim = await this.prisma.insuranceClaim.findUnique({
            where: { id },
        });
        if (!claim) {
            throw new common_1.NotFoundException('Claim not found');
        }
        claims_policy_1.ClaimsPolicy.canTransition(claim.status, dto.status);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.insuranceClaim.update({
                where: { id },
                data: { status: dto.status },
            });
            if (dto.status === client_1.InsuranceClaimStatus.APPROVED) {
            }
            if (dto.status === client_1.InsuranceClaimStatus.PAID) {
                await tx.bookingInsurance.update({
                    where: { id: claim.insuranceId },
                    data: { status: client_1.InsuranceStatus.ACTIVE },
                });
            }
            return insurance_mapper_1.InsuranceMapper.toClaimResponse(updated);
        });
    }
    async getClaims(query) {
        const claims = await this.prisma.insuranceClaim.findMany({
            where: {
                status: query.status,
            },
            orderBy: { createdAt: 'desc' },
        });
        return claims.map(insurance_mapper_1.InsuranceMapper.toClaimResponse);
    }
    async getClaim(id) {
        const claim = await this.prisma.insuranceClaim.findUnique({
            where: { id },
            include: {
                insurance: true,
            },
        });
        if (!claim) {
            throw new common_1.NotFoundException('Claim not found');
        }
        return insurance_mapper_1.InsuranceMapper.toClaimResponse(claim);
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map