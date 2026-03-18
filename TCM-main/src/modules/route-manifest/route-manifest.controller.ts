import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RouteManifestService } from './route-manifest.service';

@ApiTags('Delivery Routes')
@Controller('routes')
export class RouteManifestController {
  constructor(private readonly service: RouteManifestService) {}

  @Get(':tripId/manifest')
  @ApiOperation({ summary: 'Get trip delivery route manifest' })
  @ApiParam({
    name: 'tripId',
    type: String,
    description: 'Trip ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery Route manifest retrieved successfully',
  })
  getManifest(
    @Param('tripId', new ParseUUIDPipe()) tripId: string,
  ) {
    return this.service.getTripManifest(tripId);
  }
}