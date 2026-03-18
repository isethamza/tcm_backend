import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TripStopService } from './tripstop.service';
import { CreateTripStopDto } from './dto/create-tripstop.dto';
import { UpdateTripStopDto } from './dto/update-tripstop.dto';
import { ActivateTripStopDto } from './dto/activate-tripstop.dto';
import { AttachTripStopDto } from './dto/attach-tripstop.dto';
import { ReorderTripStopsDto } from './dto/reorder-tripstops.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Trips')
@Controller('transporteur/trip-stops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTEUR)
export class TripStopController {
  constructor(private readonly service: TripStopService) {}

  // =====================================================
  // CREATE
  // =====================================================
  @Post()
  @ApiOperation({ summary: 'Create trip stop (template or attached)' })
  create(@Body() dto: CreateTripStopDto, @Req() req: any) {
    return this.service.create(req.user.id, dto);
  }

  // =====================================================
  // ATTACH
  // =====================================================
  @Patch(':id/attach')
  @ApiOperation({ summary: 'Attach stop to a trip (auto-order)' })
  attach(
    @Param('id') stopId: string,
    @Body() dto: AttachTripStopDto,
    @Req() req: any,
  ) {
    return this.service.attach(
      req.user.id,
      stopId,
      dto.tripId,
    );
  }

  // =====================================================
  // ACTIVATE
  // =====================================================
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate stop (address + schedule)' })
  activate(
    @Param('id') stopId: string,
    @Body() dto: ActivateTripStopDto,
    @Req() req: any,
  ) {
    return this.service.activate(
      req.user.id,
      stopId,
      dto,
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update stop (locked if used)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTripStopDto,
    @Req() req: any,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  // =====================================================
  // 🔥 REORDER ROUTE
  // =====================================================
  @Patch('trip/:tripId/reorder')
  @ApiOperation({ summary: 'Reorder stops within a trip route' })
  reorder(
    @Param('tripId') tripId: string,
    @Body() dto: ReorderTripStopsDto,
    @Req() req: any,
  ) {
    return this.service.reorder(
      req.user.id,
      tripId,
      dto.stopIds,
    );
  }

  // =====================================================
  // LIST MY STOPS
  // =====================================================
  @Get()
  @ApiOperation({ summary: 'List my stops (templates + attached)' })
  list(@Req() req: any) {
    return this.service.listMyStops(req.user.id);
  }

  // =====================================================
  // LIST TRIP ROUTE
  // =====================================================
  @Get('trip/:tripId')
  @ApiOperation({ summary: 'List stops for a trip (ordered)' })
  listTripStops(
    @Param('tripId') tripId: string,
    @Req() req: any,
  ) {
    return this.service.listTripStops(tripId);
  }


  // =====================================================
  // DELETE
  // =====================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete stop (only if unused)' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.service.delete(req.user.id, id);
  }
}