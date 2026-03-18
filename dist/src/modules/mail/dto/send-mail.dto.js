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
exports.SendMailDto = exports.MailAttachmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const SUPPORTED_LOCALES = ['en', 'fr'];
class MailAttachmentDto {
}
exports.MailAttachmentDto = MailAttachmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'invoice.pdf',
        description: 'Attachment file name',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], MailAttachmentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'JVBERi0xLjQKJc...',
        description: 'Base64 encoded file content',
    }),
    (0, class_validator_1.IsBase64)(),
    __metadata("design:type", String)
], MailAttachmentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'application/pdf',
        description: 'MIME type of the attachment',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], MailAttachmentDto.prototype, "contentType", void 0);
class SendMailDto {
}
exports.SendMailDto = SendMailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@example.com',
        description: 'Recipient email address',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendMailDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Welcome to TCM Logistics',
        description: 'Email subject',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SendMailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '<h1>Hello</h1>',
        description: 'Raw HTML content (used if no template is provided). Either html OR template must be set.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMailDto.prototype, "html", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'welcome',
        description: 'Template name (without extension). Either template OR html must be set.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SendMailDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { name: 'John', ctaUrl: 'https://app.com' },
        description: 'Dynamic template data (Handlebars variables)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendMailDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'sv',
        description: 'Locale for multi-language templates (fallback: en)',
        enum: SUPPORTED_LOCALES,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(SUPPORTED_LOCALES),
    __metadata("design:type", String)
], SendMailDto.prototype, "locale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [MailAttachmentDto],
        description: 'List of attachments (base64 encoded)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MailAttachmentDto),
    __metadata("design:type", Array)
], SendMailDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            to: 'user@example.com',
            subject: 'Welcome to TCM Logistics',
            template: 'welcome',
            locale: 'sv',
            data: {
                name: 'John',
                ctaUrl: 'https://app.com',
            },
        },
    }),
    __metadata("design:type", Object)
], SendMailDto.prototype, "_example", void 0);
//# sourceMappingURL=send-mail.dto.js.map