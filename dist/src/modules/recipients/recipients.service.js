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
exports.RecipientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecipientsService = class RecipientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMyRecipients(clientId) {
        return this.prisma.recipient.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(clientId, dto) {
        return this.prisma.recipient.create({
            data: {
                clientId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                city: dto.city,
                country: dto.country,
                postalCode: dto.postalCode,
            },
        });
    }
    async update(clientId, id, dto) {
        const recipient = await this.prisma.recipient.findUnique({ where: { id } });
        if (!recipient || recipient.clientId !== clientId) {
            throw new common_1.ForbiddenException();
        }
        return this.prisma.recipient.update({
            where: { id },
            data: dto,
        });
    }
    async remove(clientId, id) {
        const recipient = await this.prisma.recipient.findUnique({ where: { id } });
        if (!recipient || recipient.clientId !== clientId) {
            throw new common_1.ForbiddenException();
        }
        return this.prisma.recipient.delete({ where: { id } });
    }
};
exports.RecipientsService = RecipientsService;
exports.RecipientsService = RecipientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipientsService);
//# sourceMappingURL=recipients.service.js.map