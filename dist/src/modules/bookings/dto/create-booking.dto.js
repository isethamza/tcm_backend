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
exports.CreateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const preview_price_dto_1 = require("./preview-price.dto");
class RecipientSnapshotDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipientSnapshotDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+33600000000' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipientSnapshotDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main street, Paris' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecipientSnapshotDto.prototype, "address", void 0);
class CreateBookingDto extends preview_price_dto_1.PreviewPriceDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trip ID',
        example: 'trip-uuid',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 48.8566 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "pickupLat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.3522 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "pickupLng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient ID',
        example: '151d1de6-530a-4e5d-893b-ebaa8bdf9984',
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional recipient snapshot',
        type: RecipientSnapshotDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RecipientSnapshotDto),
    __metadata("design:type", RecipientSnapshotDto)
], CreateBookingDto.prototype, "recipientSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional client note',
        example: 'Handle with care',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "note", void 0);
//# sourceMappingURL=create-booking.dto.js.map