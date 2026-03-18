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
exports.PricingPreviewDto = exports.InsuranceDto = exports.ParcelDto = exports.DeliveryOption = exports.PickupOption = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PickupOption;
(function (PickupOption) {
    PickupOption["STANDARD_HOME_PICKUP"] = "STANDARD_HOME_PICKUP";
    PickupOption["ADVANCED_HOME_PICKUP"] = "ADVANCED_HOME_PICKUP";
    PickupOption["SELF_DROP_AT_HUB"] = "SELF_DROP_AT_HUB";
})(PickupOption || (exports.PickupOption = PickupOption = {}));
var DeliveryOption;
(function (DeliveryOption) {
    DeliveryOption["HOME_DELIVERY"] = "HOME_DELIVERY";
    DeliveryOption["SELF_PICKUP_AT_HUB"] = "SELF_PICKUP_AT_HUB";
    DeliveryOption["SELF_PICKUP_AT_TRANSPORTEUR"] = "SELF_PICKUP_AT_TRANSPORTEUR";
})(DeliveryOption || (exports.DeliveryOption = DeliveryOption = {}));
class ParcelDto {
}
exports.ParcelDto = ParcelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParcelDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParcelDto.prototype, "lengthCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParcelDto.prototype, "widthCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParcelDto.prototype, "heightCm", void 0);
class InsuranceDto {
}
exports.InsuranceDto = InsuranceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'plan_uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InsuranceDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InsuranceDto.prototype, "declaredValue", void 0);
class PricingPreviewDto {
}
exports.PricingPreviewDto = PricingPreviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'trip_uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PricingPreviewDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ParcelDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ParcelDto),
    __metadata("design:type", Array)
], PricingPreviewDto.prototype, "parcels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PickupOption }),
    (0, class_validator_1.IsEnum)(PickupOption),
    __metadata("design:type", String)
], PricingPreviewDto.prototype, "pickupOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DeliveryOption }),
    (0, class_validator_1.IsEnum)(DeliveryOption),
    __metadata("design:type", String)
], PricingPreviewDto.prototype, "deliveryOption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: InsuranceDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InsuranceDto),
    __metadata("design:type", InsuranceDto)
], PricingPreviewDto.prototype, "insurance", void 0);
//# sourceMappingURL=pricing-preview.dto.js.map