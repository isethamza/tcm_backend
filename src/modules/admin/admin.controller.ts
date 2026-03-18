import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  // =========================
  // DASHBOARD
  // =========================
  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard overview' })
  dashboard() {
    return this.service.dashboard();
  }

  // =========================
  // USERS
  // =========================
  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  users() {
    return this.service.users();
  }

  // =========================
  // KYC
  // =========================
  @Get('kyc')
  @ApiOperation({ summary: 'Get KYC overview (admin)' })
  kyc() {
    return this.service.kyc();
  }

  // =========================
  // DISPUTES
  // =========================
  @Get('disputes')
  @ApiOperation({ summary: 'Get disputes overview (admin)' })
  disputes() {
    return this.service.disputes();
  }

  // =========================
  // LEDGER
  // =========================
  @Get('ledger')
  @ApiOperation({ summary: 'Get financial ledger (admin)' })
  ledger() {
    return this.service.ledger();
  }

  // =========================
  // TRACKING
  // =========================
  @Get('tracking')
  @ApiOperation({ summary: 'Get system tracking data (admin)' })
  tracking() {
    return this.service.tracking();
  }

  // =========================
  // SLA
  // =========================
  @Get('sla')
  @ApiOperation({ summary: 'Get SLA metrics (admin)' })
  sla() {
    return this.service.sla();
  }
}