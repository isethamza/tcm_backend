import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PreviewPriceDto } from './preview-price.dto';

/* =====================================================
   RECIPIENT SNAPSHOT DTO (NEW - STRONGLY TYPED)
===================================================== */

class RecipientSnapshotDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+33600000000' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main street, Paris' })
  @IsString()
  address: string;
}

/* =====================================================
   CREATE BOOKING DTO
===================================================== */

export class CreateBookingDto extends PreviewPriceDto {
  /* ============================================
     REQUIRED: TRIP
  ============================================ */

  @ApiProperty({
    description: 'Trip ID',
    example: 'trip-uuid',
  })
  @IsUUID('4')
  tripId: string;

  /* ============================================
     REQUIRED: PICKUP LOCATION
  ============================================ */

  @ApiProperty({ example: 48.8566 })
  @IsNumber()
  pickupLat: number;

  @ApiProperty({ example: 2.3522 })
  @IsNumber()
  pickupLng: number;

  /* ============================================
     RECIPIENT
  ============================================ */

  @ApiProperty({
    description: 'Recipient ID',
    example: '151d1de6-530a-4e5d-893b-ebaa8bdf9984',
  })
  @IsUUID('4')
  recipientId: string;

  /* ============================================
     OPTIONAL SNAPSHOT (STRONGLY TYPED)
  ============================================ */

  @ApiPropertyOptional({
    description: 'Optional recipient snapshot',
    type: RecipientSnapshotDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecipientSnapshotDto)
  recipientSnapshot?: RecipientSnapshotDto;

  /* ============================================
     OPTIONAL CLIENT NOTE
  ============================================ */

  @ApiPropertyOptional({
    description: 'Optional client note',
    example: 'Handle with care',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}