import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
} from 'class-validator';
import { ParcelStatus, UserRole } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CreateHandoverDto {
  /* ========================================
     SCOPE (ONLY ONE REQUIRED)
  ======================================== */

  @ApiPropertyOptional({
    description: 'Batch ID (for batch handover)',
  })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Parcel ID (for single parcel handover)',
  })
  @IsOptional()
  @IsUUID()
  parcelId?: string;

  /* ========================================
     TARGET (WHO RECEIVES)
  ======================================== */

  @ApiProperty({
    enum: UserRole,
    description: 'Receiver role',
    example: UserRole.HUB_MANAGER,
  })
  @IsEnum(UserRole)
  toType: UserRole;

  @ApiPropertyOptional({
    description: 'Receiver user ID (required for USER roles)',
  })
  @IsOptional()
  @IsUUID()
  toUserId?: string;

  @ApiPropertyOptional({
    description: 'Target hub ID (required for HUB_MANAGER)',
  })
  @IsOptional()
  @IsUUID()
  toHubId?: string;

  /* ========================================
     CONDITION
  ======================================== */

  @ApiPropertyOptional({
    enum: ParcelStatus,
    description: 'Declared parcel status at handover',
    example: ParcelStatus.PICKED_UP,
  })
  @IsOptional()
  @IsEnum(ParcelStatus)
  declaredStatus?: ParcelStatus;

  /* ========================================
     EXTRA
  ======================================== */

  @ApiPropertyOptional({
    description: 'Notes for the handover',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Photo URLs as evidence',
    example: ['https://cdn/app/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Type(() => String)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.map(v => v.trim()))]
      : value,
  )
  @IsString({ each: true })
  photos?: string[];
}