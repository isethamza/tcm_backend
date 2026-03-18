import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Public Trips')
@Controller('trips')
export class PublicTripsController {
  constructor(private readonly tripsService: TripsService) {}

  // =========================
  // PUBLIC — Trip details
  // =========================
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public trip details by ID' })
  getPublicTrip(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tripsService.getPublicTripById(id);
  }
}