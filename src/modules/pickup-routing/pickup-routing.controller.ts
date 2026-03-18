import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  // UseGuards, // optional
} from '@nestjs/common';

import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { PickupRoutingService } from './pickup-routing.service';

// optional
// import { AuthGuard } from 'src/modules/auth/auth.guard';

@ApiTags('Pickup Routing')
@Controller('pickup-routing')
export class PickupRoutingController {
  constructor(
    private readonly pickupRoutingService: PickupRoutingService,
  ) {}

  //////////////////////
  // 🚚 TRANSPORTEUR ROUTE
  //////////////////////
  @Get(':tripId')
  @ApiOperation({
    summary: 'Get pickup route for a trip',
  })
  @ApiOkResponse({
    description: 'Pickup route with ordered stops',
  })
  async getPickupRoute(@Param('tripId') tripId: string) {
    return this.pickupRoutingService.getPickupRoute(tripId);
  }

  //////////////////////
  // 🔍 DEBUG SOLVER
  //////////////////////
  @Post('debug/solve-preview')
  @ApiOperation({
    summary: 'Preview pickup routing solver-DEBUG ONLY!!!!',
    description: 'Calls Python routing solver (DEBUG ONLY!!!)',
  })
  @ApiOkResponse({
    description: 'Route result from solver',
  })
  async solvePreview(@Body() body: { matrix: number[][] }) {
    const res = await fetch(
      process.env.ROUTING_API_URL || 'http://127.0.0.1:8000/solve',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!res.ok) {
      throw new Error(`Solver failed: ${res.status}`);
    }

    const data = await res.json();

    return {
      success: true,
      solver: data,
    };
  }
}