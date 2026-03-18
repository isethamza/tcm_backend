import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchHubDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Required parcel weight' })
  @IsOptional()
  @IsNumber()
  requiredWeightKg?: number;

  @ApiPropertyOptional({ description: 'Required parcel volume m3' })
  @IsOptional()
  @IsNumber()
  requiredVolumeM3?: number;
}
