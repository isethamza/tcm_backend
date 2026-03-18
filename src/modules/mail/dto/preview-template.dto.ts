import {
  IsObject,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SUPPORTED_LOCALES = ['en', 'fr'];

export class PreviewTemplateDto {
  @ApiProperty({
    example: 'welcome',
    description: 'Template name (without file extension)',
  })
  @IsString()
  @MaxLength(100)
  template: string;

  @ApiPropertyOptional({
    example: { name: 'John', ctaUrl: 'https://app.com' },
    description: 'Dynamic data injected into the template',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'sv',
    description: 'Locale for template rendering (fallback: en)',
    enum: SUPPORTED_LOCALES,
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LOCALES)
  locale?: string;

  // 🔥 full preview example
  @ApiProperty({
    example: {
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