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
exports.HubOpeningHoursDto = exports.WeekDay = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var WeekDay;
(function (WeekDay) {
    WeekDay["MONDAY"] = "MONDAY";
    WeekDay["TUESDAY"] = "TUESDAY";
    WeekDay["WEDNESDAY"] = "WEDNESDAY";
    WeekDay["THURSDAY"] = "THURSDAY";
    WeekDay["FRIDAY"] = "FRIDAY";
    WeekDay["SATURDAY"] = "SATURDAY";
    WeekDay["SUNDAY"] = "SUNDAY";
})(WeekDay || (exports.WeekDay = WeekDay = {}));
class HubOpeningHoursDto {
}
exports.HubOpeningHoursDto = HubOpeningHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: WeekDay,
        example: WeekDay.MONDAY,
        description: 'Day of the week',
    }),
    (0, class_validator_1.IsEnum)(WeekDay),
    __metadata("design:type", String)
], HubOpeningHoursDto.prototype, "day", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether hub is open that day',
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HubOpeningHoursDto.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '08:00',
        description: 'Opening time (HH:mm)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'openTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], HubOpeningHoursDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '18:00',
        description: 'Closing time (HH:mm)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'closeTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], HubOpeningHoursDto.prototype, "closeTime", void 0);
//# sourceMappingURL=hub-opening-hours.dto.js.map