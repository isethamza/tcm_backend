import {
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsArray,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomsItemDto } from './customs-item.dto';

export class ParcelDto {
  @ApiProperty({
    description: 'Weight of the parcel in kilograms',
    example: 2.5,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'weightKg must be a valid number' },
  )
  @Min(0.01)
  @Max(1000) // safety cap (adjust business limit)
  weightKg: number;

  @ApiProperty({
    description: 'Length of parcel in centimeters',
    example: 30,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  lengthCm: number;

  @ApiProperty({
    description: 'Width of parcel in centimeters',
    example: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  widthCm: number;

  @ApiProperty({
    description: 'Height of parcel in centimeters',
    example: 15,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  heightCm: number;

  /* ============================================
     VALUE (INSURANCE / CUSTOMS)
  ============================================ */

  @ApiPropertyOptional({
    description: 'Estimated parcel value (insurance/customs)',
    example: 150,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'estimatedValue must be a valid amount' },
  )
  @Min(0)
  @Max(100000) // safety cap
  estimatedValue?: number;

  /* ============================================
     CUSTOMS ITEMS
  ============================================ */

  @ApiPropertyOptional({
    description:
      'Customs declaration items (required for international shipments)',
    type: () => [CustomsItemDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomsItemDto)
  customsItems?: CustomsItemDto[];
}