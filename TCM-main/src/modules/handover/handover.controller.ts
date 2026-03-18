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

import { HandoverService } from './handover.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { UserRole } from '@prisma/client';

import { CreateHandoverDto } from './dto/create-handover.dto';
import { AcceptHandoverDto } from './dto/accept-handover.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

/* ========================================
   TYPES
======================================== */
interface AuthRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Handover')
@ApiBearerAuth()
@Controller('transporteur/handover')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HandoverController {
  constructor(private readonly service: HandoverService) {}

  /* =====================================================
     CREATE HANDOVER
  ===================================================== */
  @Post()
  @Roles(UserRole.TRANSPORTEUR, UserRole.HUB_MANAGER)
  @ApiOperation({ summary: 'Create handover event (batch or parcel)' })
  @ApiResponse({ status: 201, description: 'Handover created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Req() req: AuthRequest,
    @Body() dto: CreateHandoverDto,
  ) {
    return this.service.create(dto, req.user.id);
  }

  /* =====================================================
     ACCEPT / REJECT
  ===================================================== */
  @Post(':id/accept')
  @Roles(
    UserRole.TRANSPORTEUR,
    UserRole.HUB_MANAGER,
    UserRole.RECIPIENT,
  )
  @ApiOperation({ summary: 'Accept or reject handover' })
  @ApiParam({ name: 'id', description: 'Handover ID' })
  @ApiResponse({ status: 200, description: 'Handover processed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  accept(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptHandoverDto,
  ) {
    return this.service.accept(
      id,
      req.user.id,
      dto.accept,
    );
  }

  /* =====================================================
     GET BY BOOKING
  ===================================================== */
  @Get('booking/:bookingId')
  @Roles(UserRole.TRANSPORTEUR, UserRole.HUB_MANAGER)
  @ApiOperation({ summary: 'Get handover chain for booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Handover list' })
  getByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.service.getByBooking(bookingId);
  }
}