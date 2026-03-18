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
exports.CreateHandoverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreateHandoverDto {
}
exports.CreateHandoverDto = CreateHandoverDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Batch ID (for batch handover)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "batchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parcel ID (for single parcel handover)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "parcelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.UserRole,
        description: 'Receiver role',
        example: client_1.UserRole.HUB_MANAGER,
    }),
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "toType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Receiver user ID (required for USER roles)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "toUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target hub ID (required for HUB_MANAGER)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "toHubId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.ParcelStatus,
        description: 'Declared parcel status at handover',
        example: client_1.ParcelStatus.PICKED_UP,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ParcelStatus),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "declaredStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notes for the handover',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Photo URLs as evidence',
        example: ['https://cdn/app/photo1.jpg'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(10),
    (0, class_transformer_1.Type)(() => String),
    (0, class_transformer_1.Transform)(({ value }) => Array.isArray(value)
        ? [...new Set(value.map(v => v.trim()))]
        : value),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateHandoverDto.prototype, "photos", void 0);
//# sourceMappingURL=create-handover.dto.js.map