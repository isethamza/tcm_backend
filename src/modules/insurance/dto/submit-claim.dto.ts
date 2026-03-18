import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitClaimDto {
  @ApiProperty()
  @IsString()
  insuranceId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  evidenceUrls?: string[];

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  claimedAmount: number;
}