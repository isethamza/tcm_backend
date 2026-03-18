import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycApprovedGuard } from '../kyc/kyc-approved.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateTripDto } from './dto/update-trip.dto';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Trips')
@ApiBearerAuth()
@Controller('transporteur/trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTEUR)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // =========================
  // Create trip (KYC required)
  // =========================
  @Post()
  @UseGuards(KycApprovedGuard)
  @ApiOperation({ summary: 'Create trip (KYC required)' })
  createTrip(
    @Req() req: AuthRequest,
    @Body() dto: any,
  ) {
    return this.tripsService.create(dto, req.user.id, req.user.role);
  }

  // =========================
  // My trips
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get my trips' })
  myTrips(@Req() req: AuthRequest) {
    return this.tripsService.myTrips(req.user.id);
  }

  // =========================
  // Public search
  // =========================
  @Get('search')
  @Roles()
  @ApiOperation({ summary: 'Search trips (public)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'date', required: false })
  search(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
  ) {
    return this.tripsService.search({ from, to, date });
  }

  // =========================
  // Advanced search
  // =========================
  @Get('searchByCountryCity')
  @Roles()
  @ApiOperation({ summary: 'Advanced trip search' })
  searchByCountryCity(@Query() q: any) {
    return this.tripsService.searchAdvanced({
      fromCountry: q.fromCountry,
      fromCity: q.fromCity,
      toCountry: q.toCountry,
      toCity: q.toCity,
      date: q.date,
      maxPriceKg: q.maxPriceKg ? Number(q.maxPriceKg) : undefined,
    });
  }

  // =========================
  // Get own trip by ID
  // =========================
  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID (owner only)' })
  getTrip(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.getTripById(id, req.user.id);
  }

  // =========================
  // Trip actions
  // =========================
  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish trip' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.publish(id, req.user.id);
  }

  @Post(':id/draft')
  @ApiOperation({ summary: 'Move trip to draft' })
  putBackToDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.putBackToDraft(id, req.user.id);
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Hold trip' })
  hold(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.hold(id, req.user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume trip' })
  resume(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.resume(id, req.user.id);
  }

  @Post(':id/delay')
  @ApiOperation({ summary: 'Delay trip' })
  @ApiBody({
    schema: {
      example: {
        newDepartureDate: '2026-03-01T10:00:00Z',
      },
    },
  })
  delay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newDepartureDate') newDate: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.delay(id, newDate, req.user.id);
  }

  // =========================
  // Update trip
  // =========================
  @Patch(':id')
  @ApiOperation({ summary: 'Update trip (owner only)' })
  updateTrip(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.updateTrip(id, req.user.id, dto);
  }

  // =========================
  // Cancel trip
  // =========================
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel trip' })
  cancelTrip(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.cancelTrip(id, req.user.id);
  }
}