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
exports.UpdateParcelDto = exports.ParcelPickupStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ParcelPickupStatus;
(function (ParcelPickupStatus) {
    ParcelPickupStatus["VERIFIED"] = "VERIFIED";
    ParcelPickupStatus["MISSING"] = "MISSING";
    ParcelPickupStatus["DAMAGED"] = "DAMAGED";
})(ParcelPickupStatus || (exports.ParcelPickupStatus = ParcelPickupStatus = {}));
class ParcelVerificationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'parcel_uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ParcelVerificationDto.prototype, "parcelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ParcelPickupStatus,
        example: ParcelPickupStatus.VERIFIED,
    }),
    (0, class_validator_1.IsEnum)(ParcelPickupStatus),
    __metadata("design:type", String)
], ParcelVerificationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], ParcelVerificationDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], ParcelVerificationDto.prototype, "lengthCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], ParcelVerificationDto.prototype, "widthCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], ParcelVerificationDto.prototype, "heightCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Parcel not found at pickup location',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParcelVerificationDto.prototype, "failureReason", void 0);
class UpdateParcelDto {
}
exports.UpdateParcelDto = UpdateParcelDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ParcelVerificationDto],
        description: 'List of parcels to verify',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ParcelVerificationDto),
    __metadata("design:type", Array)
], UpdateParcelDto.prototype, "parcels", void 0);
//# sourceMappingURL=update-parcel.dto.js.map