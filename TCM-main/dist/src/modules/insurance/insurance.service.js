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
exports.InsuranceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InsuranceService = class InsuranceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async attachInsurance(dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const existing = await this.prisma.bookingInsurance.findUnique({
            where: {
                bookingId_status: {
                    bookingId: dto.bookingId,
                    status: 'ACTIVE',
                },
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('Insurance already exists');
        }
        const plan = await this.prisma.insurancePlan.findUnique({
            where: { id: dto.planId },
        });
        if (!plan || !plan.active) {
            throw new common_1.NotFoundException('Active insurance plan not found');
        }
        const declaredValue = Number(booking.totalPrice);
        const premium = Math.max((declaredValue * plan.percentageRate) / 100, plan.minPremium);
        const coverage = Math.min(declaredValue, plan.maxCoverage);
        return this.prisma.bookingInsurance.create({
            data: {
                bookingId: dto.bookingId,
                planId: dto.planId,
                declaredValue,
                premiumAmount: premium,
                coverageAmount: coverage,
                status: client_1.InsuranceStatus.ACTIVE,
            },
        });
    }
    async getInsurance(id) {
        const insurance = await this.prisma.bookingInsurance.findUnique({
            where: { id },
            include: {
                claims: true,
                plan: true,
                booking: true,
            },
        });
        if (!insurance) {
            throw new common_1.NotFoundException('Insurance not found');
        }
        return insurance;
    }
};
exports.InsuranceService = InsuranceService;
exports.InsuranceService = InsuranceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InsuranceService);
//# sourceMappingURL=insurance.service.js.map