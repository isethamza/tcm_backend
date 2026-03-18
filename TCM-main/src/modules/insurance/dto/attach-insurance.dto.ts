import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachInsuranceDto {
  @ApiProperty()
  @IsUUID()
  planId: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  declaredValue: number;
}