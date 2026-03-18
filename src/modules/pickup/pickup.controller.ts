import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { PickupService } from './pickup.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { UserRole } from '@prisma/client';

import { ScanPickupDto } from './dto/scan-pickup.dto';
import { VerifyArtifactDto } from './dto/verify-artifact.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { CompletePickupDto } from './dto/complete-pickup.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

/* =====================================================
   TYPES (avoid `any`)
===================================================== */
interface AuthRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Transporteur Pickup')
@ApiBearerAuth()
@Controller('transporteur/pickups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTEUR)
export class PickupController {
  constructor(private readonly service: PickupService) {}

  /* =====================================================
     GET PICKUP
  ===================================================== */
  @Get(':id')
  @ApiOperation({ summary: 'Get pickup session details' })
  @ApiParam({ name: 'id', description: 'Pickup session ID' })
  @ApiResponse({ status: 200, description: 'Pickup retrieved' })
  @ApiResponse({ status: 404, description: 'Pickup not found' })
  getPickup(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) pickupId: string,
  ) {
    return this.service.getPickup(pickupId, req.user.id);
  }

  /* =====================================================
     START PICKUP (QR SCAN)
  ===================================================== */
  @Post('scan')
  @ApiOperation({
    summary: 'Scan booking QR and start pickup session',
  })
  @ApiBody({ type: ScanPickupDto })
  @ApiResponse({ status: 200, description: 'Pickup started' })
  @ApiResponse({ status: 400, description: 'Invalid booking' })
  scan(@Req() req: AuthRequest, @Body() dto: ScanPickupDto) {
    return this.service.startPickup(dto.bookingId, req.user.id);
  }

  /* =====================================================
     ADD ARTIFACT
  ===================================================== */
  @Post(':id/artifacts')
  @ApiOperation({
    summary: 'Upload verification artifact (identity / parcel)',
  })
  @ApiParam({ name: 'id', description: 'Pickup session ID' })
  @ApiBody({ type: VerifyArtifactDto })
  @ApiResponse({ status: 201, description: 'Artifact added' })
  @ApiResponse({ status: 400, description: 'Invalid artifact' })
  addArtifact(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) pickupId: string,
    @Body() dto: VerifyArtifactDto,
  ) {
    return this.service.addArtifact(pickupId, req.user.id, dto);
  }

  /* =====================================================
     CONFIRM PARCELS
  ===================================================== */
  @Post(':id/parcels')
  @ApiOperation({
    summary: 'Confirm parcels (VERIFIED / MISSING / DAMAGED)',
  })
  @ApiParam({ name: 'id', description: 'Pickup session ID' })
  @ApiBody({ type: UpdateParcelDto })
  @ApiResponse({ status: 200, description: 'Parcels processed' })
  @ApiResponse({ status: 400, description: 'Invalid parcels' })
  confirmParcels(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) pickupId: string,
    @Body() dto: UpdateParcelDto,
  ) {
    return this.service.confirmParcels(
      pickupId,
      req.user.id,
      dto.parcels,
    );
  }

  /* =====================================================
     COMPLETE PICKUP
  ===================================================== */
  @Post(':id/complete')
  @ApiOperation({
    summary:
      'Complete pickup and collect cash (if applicable)',
  })
  @ApiParam({ name: 'id', description: 'Pickup session ID' })
  @ApiBody({ type: CompletePickupDto })
  @ApiResponse({ status: 200, description: 'Pickup completed' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  completePickup(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) pickupId: string,
    @Body() dto: CompletePickupDto,
  ) {
    return this.service.completePickup(
      pickupId,
      req.user.id,
      dto,
    );
  }
}