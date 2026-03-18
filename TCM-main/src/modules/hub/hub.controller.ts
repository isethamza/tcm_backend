import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { HubService } from './hub.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Hubs')
@ApiBearerAuth()
@Controller('hubs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HubController {
  constructor(private readonly service: HubService) {}

  // =========================
  // CREATE HUB
  // =========================
  @Post()
  @Roles(UserRole.HUB_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a hub' })
  @ApiBody({
    schema: {
      example: {
        name: 'Central Hub',
        location: 'Stockholm',
        capacity: 100,
      },
    },
  })
  create(
    @Req() req: AuthRequest,
    @Body() dto: any,
  ) {
    return this.service.createHub(req.user, dto);
  }

  // =========================
  // FIND AVAILABLE HUBS
  // =========================
  @Post('available')
  @ApiOperation({ summary: 'Find available hubs' })
  @ApiBody({
    schema: {
      example: {
        location: 'Stockholm',
        requiredCapacity: 10,
      },
    },
  })
  findAvailable(@Body() dto: any) {
    return this.service.findAvailableHubs(dto);
  }

  // =========================
  // RESERVE CAPACITY
  // =========================
  @Post('reserve')
  @ApiOperation({ summary: 'Reserve hub capacity' })
  @ApiBody({
    schema: {
      example: {
        hubId: 'uuid',
        amount: 5,
      },
    },
  })
  reserve(@Body() dto: any) {
    return this.service.reserveCapacity(dto);
  }

  // =========================
  // RELEASE CAPACITY
  // =========================
  @Post('release')
  @ApiOperation({ summary: 'Release hub capacity' })
  @ApiBody({
    schema: {
      example: {
        hubId: 'uuid',
        amount: 5,
      },
    },
  })
  release(@Body() dto: any) {
    return this.service.releaseCapacity(dto);
  }

  // =========================
  // HUB UTILIZATION
  // =========================
  @Get(':id/utilization')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get hub utilization (Admin only)' })
  utilization(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getHubUtilization(id);
  }
}