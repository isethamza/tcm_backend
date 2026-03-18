import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculatePremiumDto {
  @ApiProperty({ example: 'b3f6c8c2-8b2e-4c2a-9b1e-123456789abc' })
  @IsUUID()
  planId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  declaredValue: number;
}