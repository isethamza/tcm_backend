import {
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { PickupSchedulingService } from './pickup-scheduling.service';

@ApiTags('Pickup Scheduling')
@Controller('pickup-scheduling')
export class PickupSchedulingController {
  constructor(
    private readonly service: PickupSchedulingService,
  ) {}


  /* =====================================================
     ACCEPT PROPOSAL
  ===================================================== */
  @Post('proposal/:proposalId/accept')
  @ApiOperation({ summary: 'Accept pickup proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal accepted',
  })
  async accept(
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
  ) {
    return this.service.acceptProposal(proposalId);
  }

  /* =====================================================
     REJECT PROPOSAL
  ===================================================== */
  @Post('proposal/:proposalId/reject')
  @ApiOperation({ summary: 'Reject pickup proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal rejected',
  })
  async reject(
    @Param('proposalId', ParseUUIDPipe) proposalId: string,
  ) {
    return this.service.rejectProposal(proposalId);
  }
}