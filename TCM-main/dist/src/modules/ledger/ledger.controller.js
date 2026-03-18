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
exports.LedgerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ledger_service_1 = require("./ledger.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
let LedgerController = class LedgerController {
    constructor(ledger) {
        this.ledger = ledger;
    }
    async getMyLedger(req) {
        return this.ledger.getTransporteurLedger(req.user.id);
    }
    async exportCsv(res, from, to, type) {
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        if (from && isNaN(fromDate.getTime())) {
            throw new common_1.BadRequestException('Invalid "from" date');
        }
        if (to && isNaN(toDate.getTime())) {
            throw new common_1.BadRequestException('Invalid "to" date');
        }
        const rows = await this.ledger.getLedgerForExport({
            from: fromDate,
            to: toDate,
            type,
        });
        const csv = this.toCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ledger-${Date.now()}.csv"`);
        return res.send(csv);
    }
    toCsv(rows) {
        const header = [
            'Date',
            'Type',
            'Amount',
            'BookingId',
            'ClientEmail',
            'TransporteurId',
            'HubId',
        ];
        const lines = rows.map((r) => [
            r.createdAt?.toISOString() ?? '',
            r.type ?? '',
            r.amount ?? '',
            r.payment?.bookingId ?? '',
            r.payment?.booking?.client?.email ?? '',
            r.transporteurId ?? '',
            r.hubId ?? '',
        ]);
        return [header, ...lines]
            .map((l) => l
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','))
            .join('\n');
    }
};
exports.LedgerController = LedgerController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transporteur ledger' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getMyLedger", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export ledger as CSV file' }),
    (0, swagger_1.ApiProduces)('text/csv'),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, example: '2025-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, example: '2025-01-31' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: client_1.LedgerEntryType,
    }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "exportCsv", null);
exports.LedgerController = LedgerController = __decorate([
    (0, swagger_1.ApiTags)('Ledger'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transporteur/ledger'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map