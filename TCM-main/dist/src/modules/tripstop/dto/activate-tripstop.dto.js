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
exports.ActivateTripStopDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ActivateTripStopDto {
}
exports.ActivateTripStopDto = ActivateTripStopDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12 Rue de Rivoli' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivateTripStopDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-10' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ActivateTripStopDto.prototype, "openDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'openTime must be HH:mm format',
    }),
    __metadata("design:type", String)
], ActivateTripStopDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'closeTime must be HH:mm format',
    }),
    __metadata("design:type", String)
], ActivateTripStopDto.prototype, "closeTime", void 0);
//# sourceMappingURL=activate-tripstop.dto.js.map