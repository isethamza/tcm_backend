import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { UserRole } from '@prisma/client';

import { HandoverBatchService } from './handover-batch.service';
import { AutoGroupBatchDto } from './dto/auto-group.dto';
import { ManualCreateBatchDto } from './dto/manual-create-batch.dto';
import { AddParcelsToBatchDto } from './dto/add-parcels.dto';

/* ========================================
   TYPES
======================================== */
interface AuthRequest extends Request {
  user: { id: string; role: UserRole };
}

@ApiTags('Handover Batch')
@ApiBearerAuth()
@Controller('transporteur/batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTEUR)
export class HandoverBatchController {
  constructor(private readonly service: HandoverBatchService) {}

  /* ========================================
     AUTO GROUP
  ======================================== */
  @Post('auto-group')
  @ApiOperation({ summary: 'Auto group parcels into batches' })
  @ApiResponse({ status: 200, description: 'Batches created' })
  autoGroup(
    @Req() req: AuthRequest,
    @Body() dto: AutoGroupBatchDto,
  ) {
    return this.service.autoGroupAndAssign(
      req.user.id,
      dto.parcelIds,
    );
  }

  /* ========================================
     MANUAL CREATE
  ======================================== */
  @Post()
  @ApiOperation({ summary: 'Create empty batch manually' })
  @ApiResponse({ status: 201, description: 'Batch created' })
  createBatch(
    @Req() req: AuthRequest,
    @Body() dto: ManualCreateBatchDto,
  ) {
return this.service.createBatch(req.user.id, {
  type: dto.type,
  value: dto.value,
});  }

  /* ========================================
     ADD PARCELS (SAFE WRAPPER)
  ======================================== */
  @Post(':id/parcels')
  @ApiOperation({ summary: 'Add parcels to batch' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({ status: 200, description: 'Parcels added' })
  addParcels(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) batchId: string,
    @Body() dto: AddParcelsToBatchDto,
  ) {
    return this.service.addParcels(
      req.user.id,
      batchId,
      dto.parcelIds,
    );
  }

  /* ========================================
     GET BATCH
  ======================================== */
  @Get(':id')
  @ApiOperation({ summary: 'Get batch details' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({ status: 200, description: 'Batch retrieved' })
  getBatch(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getBatchById(req.user.id, id);
  }

  /* ========================================
     LIST BATCHES (IMPORTANT)
  ======================================== */
  @Get()
  @ApiOperation({ summary: 'List batches for transporteur' })
  @ApiResponse({ status: 200, description: 'Batches list' })
  list(@Req() req: AuthRequest) {
    return this.service.listBatches(req.user.id);
  }
}