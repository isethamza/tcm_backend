import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  MaxLength,
  IsBase64,
  IsIn,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SUPPORTED_LOCALES = ['en', 'fr'];

export class MailAttachmentDto {
  @ApiProperty({
    example: 'invoice.pdf',
    description: 'Attachment file name',
  })
  @IsString()
  @MaxLength(255)
  filename: string;

  @ApiProperty({
    example: 'JVBERi0xLjQKJc...', // realistic base64 snippet
    description: 'Base64 encoded file content',
  })
  @IsBase64()
  content: string;

  @ApiPropertyOptional({
    example: 'application/pdf',
    description: 'MIME type of the attachment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contentType?: string;
}

export class SendMailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'Welcome to TCM Logistics',
    description: 'Email subject',
  })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiPropertyOptional({
    example: '<h1>Hello</h1>',
    description:
      'Raw HTML content (used if no template is provided). Either html OR template must be set.',
  })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({
    example: 'welcome',
    description:
      'Template name (without extension). Either template OR html must be set.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  template?: string;

  @ApiPropertyOptional({
    example: { name: 'John', ctaUrl: 'https://app.com' },
    description: 'Dynamic template data (Handlebars variables)',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'sv',
    description: 'Locale for multi-language templates (fallback: en)',
    enum: SUPPORTED_LOCALES,
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LOCALES)
  locale?: string;

  @ApiPropertyOptional({
    type: [MailAttachmentDto],
    description: 'List of attachments (base64 encoded)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5) // 🔒 prevent abuse
  @ValidateNested({ each: true })
  @Type(() => MailAttachmentDto)
  attachments?: MailAttachmentDto[];

  // 🔥 FULL request example (this is what you asked for)
  @ApiProperty({
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
  })
  _example?: any;
}