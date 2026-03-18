import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RejectProposalDto {
  @ApiProperty()
  @IsUUID()
  proposalId: string;
}