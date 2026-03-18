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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LedgerService = class LedgerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordForPayment(params) {
        if (!params.paymentId) {
            throw new common_1.BadRequestException('paymentId is required');
        }
        const writes = [];
        writes.push(this.prisma.ledgerEntry.create({
            data: {
                payment: { connect: { id: params.paymentId } },
                type: client_1.LedgerEntryType.CLIENT_PAYMENT,
                amount: params.totalAmount,
            },
        }));
        if (params.platformCommission > 0) {
            writes.push(this.prisma.ledgerEntry.create({
                data: {
                    payment: { connect: { id: params.paymentId } },
                    type: client_1.LedgerEntryType.PLATFORM_COMMISSION,
                    amount: params.platformCommission,
                },
            }));
        }
        if (params.vatAmount && params.vatAmount > 0) {
            writes.push(this.prisma.ledgerEntry.create({
                data: {
                    payment: { connect: { id: params.paymentId } },
                    type: client_1.LedgerEntryType.VAT,
                    amount: params.vatAmount,
                },
            }));
        }
        if (params.transporteurAmount > 0) {
            writes.push(this.prisma.ledgerEntry.create({
                data: {
                    payment: { connect: { id: params.paymentId } },
                    transporteurId: params.transporteurId,
                    type: client_1.LedgerEntryType.TRANSPORTEUR_PAYOUT,
                    amount: params.transporteurAmount,
                },
            }));
        }
        if (params.hubAmount && params.hubId) {
            writes.push(this.prisma.ledgerEntry.create({
                data: {
                    payment: { connect: { id: params.paymentId } },
                    hub: { connect: { id: params.hubId } },
                    type: client_1.LedgerEntryType.HUB_PAYOUT,
                    amount: params.hubAmount,
                },
            }));
        }
        if (params.insuranceAmount && params.insuranceAmount > 0) {
            writes.push(this.prisma.ledgerEntry.create({
                data: {
                    payment: { connect: { id: params.paymentId } },
                    type: client_1.LedgerEntryType.INSURANCE_PREMIUM,
                    amount: params.insuranceAmount,
                },
            }));
        }
        await this.prisma.$transaction(writes);
    }
    async recordForInsurancePayout(data) {
        return this.prisma.ledgerEntry.create({
            data: {
                payment: { connect: { id: data.paymentId } },
                type: client_1.LedgerEntryType.INSURANCE_PAYOUT,
                amount: data.amount,
            },
        });
    }
    async recordRefund(params) {
        return this.prisma.ledgerEntry.create({
            data: {
                payment: { connect: { id: params.paymentId } },
                type: client_1.LedgerEntryType.REFUND,
                amount: params.amount,
            },
        });
    }
    async getLedgerForExport(filters) {
        return this.prisma.ledgerEntry.findMany({
            where: {
                ...(filters.type && { type: filters.type }),
                createdAt: {
                    ...(filters.from && { gte: filters.from }),
                    ...(filters.to && { lte: filters.to }),
                },
            },
            include: {
                payment: {
                    include: {
                        booking: {
                            include: {
                                client: true,
                                trip: true,
                            },
                        },
                    },
                },
                hub: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTransporteurLedger(transporteurId) {
        return this.prisma.ledgerEntry.findMany({
            where: { transporteurId },
            include: {
                payment: {
                    include: {
                        booking: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map