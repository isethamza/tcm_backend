import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CompletePickupDto {
  @ApiProperty({
    description: 'Cash collected from client (if any)',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // ✅ critical fix
  @IsNumber()
  @Min(0)
  cashCollected?: number;
}