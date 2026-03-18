import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsString,
  ArrayMinSize,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/* ===============================
   ENUM
=============================== */
export enum ParcelPickupStatus {
  VERIFIED = 'VERIFIED',
  MISSING = 'MISSING',
  DAMAGED = 'DAMAGED',
}

/* ===============================
   PARCEL DTO
=============================== */
class ParcelVerificationDto {
  @ApiProperty({ example: 'parcel_uuid' })
  @IsUUID()
  parcelId: string;

  @ApiProperty({
    enum: ParcelPickupStatus,
    example: ParcelPickupStatus.VERIFIED,
  })
  @IsEnum(ParcelPickupStatus)
  status: ParcelPickupStatus;

  /* ===============================
     DIMENSIONS
  =============================== */

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightKg?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  lengthCm?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  widthCm?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  heightCm?: number;

  /* ===============================
     ISSUE DETAILS
  =============================== */

  @ApiPropertyOptional({
    example: 'Parcel not found at pickup location',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}

/* ===============================
   ROOT DTO
=============================== */
export class UpdateParcelDto {
  @ApiProperty({
    type: [ParcelVerificationDto],
    description: 'List of parcels to verify',
  })
  @IsArray()
  @ArrayMinSize(1) 
  @ValidateNested({ each: true })
  @Type(() => ParcelVerificationDto)
  parcels: ParcelVerificationDto[];
}