import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/* =====================================================
   ENUMS
===================================================== */

export enum PickupOption {
  STANDARD_HOME_PICKUP = 'STANDARD_HOME_PICKUP',
  ADVANCED_HOME_PICKUP = 'ADVANCED_HOME_PICKUP',
  SELF_DROP_AT_HUB = 'SELF_DROP_AT_HUB',
}

export enum DeliveryOption {
  HOME_DELIVERY = 'HOME_DELIVERY',
  SELF_PICKUP_AT_HUB = 'SELF_PICKUP_AT_HUB',
  SELF_PICKUP_AT_TRANSPORTEUR = 'SELF_PICKUP_AT_TRANSPORTEUR',
}

/* =====================================================
   PARCEL
===================================================== */

export class ParcelDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  weightKg: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  lengthCm: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Min(0)
  widthCm: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  heightCm: number;
}

/* =====================================================
   INSURANCE
===================================================== */

export class InsuranceDto {
  @ApiProperty({ example: 'plan_uuid' })
  @IsString()
  planId: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  declaredValue: number;
}

/* =====================================================
   MAIN DTO
===================================================== */

export class PricingPreviewDto {
  @ApiProperty({ example: 'trip_uuid' })
  @IsString()
  tripId: string;

  @ApiProperty({ type: [ParcelDto] })
  @ValidateNested({ each: true })
  @Type(() => ParcelDto)
  parcels: ParcelDto[];

  @ApiProperty({ enum: PickupOption })
  @IsEnum(PickupOption)
  pickupOption: PickupOption;

  @ApiProperty({ enum: DeliveryOption })
  @IsEnum(DeliveryOption)
  deliveryOption: DeliveryOption;

  @ApiProperty({ required: false, type: InsuranceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;
}