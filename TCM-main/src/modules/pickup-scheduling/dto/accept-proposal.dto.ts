import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcceptProposalDto {
  @ApiProperty()
  @IsUUID()
  proposalId: string;
}