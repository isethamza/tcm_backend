import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InsuranceClaimStatus } from '@prisma/client';

export class ReviewClaimDto {
  @ApiProperty({ enum: InsuranceClaimStatus })
  @IsEnum(InsuranceClaimStatus)
  status: InsuranceClaimStatus;
}