import {
  IsUUID,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { Type } from 'class-transformer';

import { ParcelDto } from './parcel.dto';

import {
  PickupOption,
  DeliveryOption,
} from '@prisma/client';

/* ===============================
   INSURANCE DTO
=============================== */
export class InsuranceDto {
  @ApiProperty({
    example: 'plan_uuid',
    format: 'uuid',
  })
  @IsUUID('4')
  planId: string;

  @ApiProperty({
    example: 200,
    description: 'Declared value for insurance',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  declaredValue: number;
}

/* ===============================
   PREVIEW PRICE DTO ✅
=============================== */
export class PreviewPriceDto {
  @ApiProperty({
    description: 'Trip ID',
    example: '6d09ac29-4872-4119-bb08-7dc16ea7c1d4',
    format: 'uuid',
  })
  @IsUUID('4')
  tripId: string;

  @ApiProperty({
    type: [ParcelDto],
    description: 'List of parcels',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParcelDto)
  parcels: ParcelDto[];

  @ApiProperty({
    enum: PickupOption,
    example: PickupOption.STANDARD_HOME_PICKUP,
  })
  @IsEnum(PickupOption)
  pickupOption: PickupOption;

  @ApiProperty({
    enum: DeliveryOption,
    example: DeliveryOption.HOME_DELIVERY,
  })
  @IsEnum(DeliveryOption)
  deliveryOption: DeliveryOption;

  @ApiPropertyOptional({
    type: InsuranceDto,
    description: 'Optional insurance selection',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;
}