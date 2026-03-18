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
        const entries = [
            {
                paymentId: params.paymentId,
                type: client_1.LedgerEntryType.CLIENT_PAYMENT,
                amount: params.totalAmount,
            },
            {
                paymentId: params.paymentId,
                type: client_1.LedgerEntryType.PLATFORM_COMMISSION,
                amount: -params.platformCommission,
            },
            {
                paymentId: params.paymentId,
                type: client_1.LedgerEntryType.VAT,
                amount: -params.vatAmount,
            },
            {
                paymentId: params.paymentId,
                type: client_1.LedgerEntryType.TRANSPORTEUR_PAYOUT,
                amount: -params.transporteurAmount,
                transporteurId: params.transporteurId,
            },
        ];
        if (params.hubAmount && params.hubAmount > 0 && params.hubId) {
            entries.push({
                paymentId: params.paymentId,
                type: client_1.LedgerEntryType.HUB_PAYOUT,
                amount: -params.hubAmount,
                hubId: params.hubId,
            });
        }
        await this.prisma.ledgerEntry.createMany({ data: entries });
    }
    async getLedgerForExport(filters) {
        return this.prisma.ledgerEntry.findMany({
            where: {
                createdAt: {
                    gte: filters?.from,
                    lte: filters?.to,
                },
                type: filters?.type,
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
//# sourceMappingURL=ledger.service%20-%20old.js.map