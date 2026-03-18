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
exports.VerifyArtifactDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class VerifyArtifactDto {
}
exports.VerifyArtifactDto = VerifyArtifactDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.VerificationArtifactType,
        example: client_1.VerificationArtifactType.PARCEL,
    }),
    (0, class_validator_1.IsEnum)(client_1.VerificationArtifactType),
    __metadata("design:type", String)
], VerifyArtifactDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Public URL of uploaded file',
        example: 'https://cdn.app.com/uploads/file.jpg',
        maxLength: 2048,
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsUrl)({ protocols: ['http', 'https'], require_protocol: true }, { message: 'fileUrl must be a valid HTTP/HTTPS URL' }),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", String)
], VerifyArtifactDto.prototype, "fileUrl", void 0);
//# sourceMappingURL=verify-artifact.dto.js.map