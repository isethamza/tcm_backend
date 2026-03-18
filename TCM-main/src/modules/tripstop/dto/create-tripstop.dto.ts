import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripStopDto {
  @ApiProperty({
    example: 'POPUP – Paris Center',
  })
  @IsString()
  name: string;

  @ApiProperty({ example: 'FR' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiPropertyOptional({
    example: '12 Rue de Rivoli',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '2026-03-10',
  })
  @IsOptional()
  @IsDateString()
  openDate?: string;

  @ApiPropertyOptional({
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({
    example: '18:00',
  })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowDropoff?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowPickup?: boolean;

  @ApiPropertyOptional({
    description: 'Optional trip attachment',
  })
  @IsOptional()
  @IsUUID()
  tripId?: string;
}