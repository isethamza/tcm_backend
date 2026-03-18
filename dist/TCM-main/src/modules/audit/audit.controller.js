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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AuditController = class AuditController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(req, action, entity) {
        if (req.user.role !== 'ADMIN')
            return [];
        return this.prisma.auditLog.findMany({
            where: {
                ...(action && { action: action }),
                ...(entity && { entity }),
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                actor: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List audit logs (Admin only)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'action',
        required: false,
        description: 'Filter by action type',
        example: 'CREATE_BOOKING',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'entity',
        required: false,
        description: 'Filter by entity name',
        example: 'BOOKING',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of audit logs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden (not admin)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "list", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('admin/audit'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map