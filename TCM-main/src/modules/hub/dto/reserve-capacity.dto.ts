import { IsUUID, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReserveCapacityDto {
  @ApiProperty({ example: 'c8f4c8e1-9c4d-4e19-b4c4-123456789abc' })
  @IsUUID()
  hubId: string;

  @ApiProperty({ example: 12.5 })
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
