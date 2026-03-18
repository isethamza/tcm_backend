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
exports.PreviewPriceDto = exports.InsuranceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const parcel_dto_1 = require("./parcel.dto");
const client_1 = require("@prisma/client");
class InsuranceDto {
}
exports.InsuranceDto = InsuranceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'plan_uuid',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], InsuranceDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 200,
        description: 'Declared value for insurance',
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InsuranceDto.prototype, "declaredValue", void 0);
class PreviewPriceDto {
}
exports.PreviewPriceDto = PreviewPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trip ID',
        example: '6d09ac29-4872-4119-bb08-7dc16ea7c1d4',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], PreviewPriceDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [parcel_dto_1.ParcelDto],
        description: 'List of parcels',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => parcel_dto_1.ParcelDto),
    __metadata("design:type", Array)
], PreviewPriceDto.prototype, "parcels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PickupOption,
        example: client_1.PickupOption.STANDARD_HOME_PICKUP,
    }),
    (0, class_validator_1.IsEnum)(client_1.PickupOption),
    __metadata("design:type", String)
], PreviewPriceDto.prototype, "pickupOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.DeliveryOption,
        example: client_1.DeliveryOption.HOME_DELIVERY,
    }),
    (0, class_validator_1.IsEnum)(client_1.DeliveryOption),
    __metadata("design:type", String)
], PreviewPriceDto.prototype, "deliveryOption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: InsuranceDto,
        description: 'Optional insurance selection',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InsuranceDto),
    __metadata("design:type", InsuranceDto)
], PreviewPriceDto.prototype, "insurance", void 0);
//# sourceMappingURL=preview-price.dto.js.map