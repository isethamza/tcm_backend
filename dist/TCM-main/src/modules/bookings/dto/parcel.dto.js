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
exports.ParcelDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const customs_item_dto_1 = require("./customs-item.dto");
class ParcelDto {
}
exports.ParcelDto = ParcelDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weight of the parcel in kilograms',
        example: 2.5,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'weightKg must be a valid number' }),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], ParcelDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Length of parcel in centimeters',
        example: 30,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], ParcelDto.prototype, "lengthCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Width of parcel in centimeters',
        example: 20,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], ParcelDto.prototype, "widthCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Height of parcel in centimeters',
        example: 15,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], ParcelDto.prototype, "heightCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated parcel value (insurance/customs)',
        example: 150,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'estimatedValue must be a valid amount' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], ParcelDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customs declaration items (required for international shipments)',
        type: () => [customs_item_dto_1.CustomsItemDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => customs_item_dto_1.CustomsItemDto),
    __metadata("design:type", Array)
], ParcelDto.prototype, "customsItems", void 0);
//# sourceMappingURL=parcel.dto.js.map