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
exports.CreateHubDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const hub_opening_hours_dto_1 = require("./hub-opening-hours.dto");
class CreateHubDto {
}
exports.CreateHubDto = CreateHubDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Paris Central Hub',
        description: 'Hub public name',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHubDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'France' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHubDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Paris' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHubDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '12 Rue de Logistics',
        description: 'Full street address',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHubDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '75001',
        description: 'Postal code',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHubDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.HubType,
        example: client_1.HubType.FIRST_LAST_MILE,
        description: 'Hub operational type',
    }),
    (0, class_validator_1.IsEnum)(client_1.HubType),
    __metadata("design:type", String)
], CreateHubDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10000,
        description: 'Maximum total parcel weight allowed in kilograms',
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateHubDto.prototype, "maxParcelWeightKg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Maximum total parcel volume allowed in cubic meters',
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateHubDto.prototype, "maxParcelVolumeM3", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [hub_opening_hours_dto_1.HubOpeningHoursDto],
        description: 'Weekly opening schedule',
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => hub_opening_hours_dto_1.HubOpeningHoursDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateHubDto.prototype, "openingHours", void 0);
//# sourceMappingURL=create-hub.dto.js.map