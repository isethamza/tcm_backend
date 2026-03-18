import { IsString, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindAvailableHubsDto {
  @ApiProperty({ example: 'France' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({
    example: 12.5,
    description: 'Parcel weight in kilograms',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weightKg: number;

  @ApiProperty({ example: 40 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lengthCm: number;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  widthCm: number;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  heightCm: number;
}
