import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HubType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HubOpeningHoursDto } from './hub-opening-hours.dto';

export class CreateHubDto {
  @ApiProperty({
    example: 'Paris Central Hub',
    description: 'Hub public name',
  })
  @IsString()
  name: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({
    example: '12 Rue de Logistics',
    description: 'Full street address',
  })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    example: '75001',
    description: 'Postal code',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    enum: HubType,
    example: HubType.FIRST_LAST_MILE,
    description: 'Hub operational type',
  })
  @IsEnum(HubType)
  type: HubType;

  @ApiProperty({
    example: 10000,
    description: 'Maximum total parcel weight allowed in kilograms',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxParcelWeightKg: number;

  @ApiProperty({
    example: 120,
    description: 'Maximum total parcel volume allowed in cubic meters',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxParcelVolumeM3: number;

  @ApiProperty({
    type: [HubOpeningHoursDto],
    description: 'Weekly opening schedule',
  })
  @ValidateNested({ each: true })
  @Type(() => HubOpeningHoursDto)
  @ArrayMinSize(1)
  openingHours: HubOpeningHoursDto[];
}
