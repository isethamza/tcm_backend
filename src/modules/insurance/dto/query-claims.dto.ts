import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { InsuranceClaimStatus } from '@prisma/client';

export class QueryClaimsDto {
  @ApiPropertyOptional({ enum: InsuranceClaimStatus })
  @IsOptional()
  @IsEnum(InsuranceClaimStatus)
  status?: InsuranceClaimStatus;
}