import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { SubmitClaimDto } from '../dto/submit-claim.dto';
import { ReviewClaimDto } from '../dto/review-claim.dto';
import { QueryClaimsDto } from '../dto/query-claims.dto';

@ApiTags('Insurance Claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly service: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit insurance claim' })
  submit(@Body() dto: SubmitClaimDto) {
    return this.service.submitClaim(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update claim status (admin)' })
  updateStatus(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return this.service.updateStatus(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List claims with filters' })
  getClaims(@Query() query: QueryClaimsDto) {
    return this.service.getClaims(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim details' })
  getClaim(@Param('id') id: string) {
    return this.service.getClaim(id);
  }
}