import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputesService } from './disputes.service';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('Disputes')
@ApiBearerAuth()
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // =========================
  // ADMIN — Get open disputes
  // =========================
  @Get('open')
  @ApiOperation({ summary: 'Get open disputes (Admin only)' })
  findOpen(@Req() req: AuthRequest) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.disputesService.findOpen();
  }

  // =========================
  // ADMIN — Resolve dispute
  // =========================
  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve dispute (Admin only)' })
  resolve(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.disputesService.resolve(id);
  }

  // =========================
  // ADMIN — Reject dispute
  // =========================
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject dispute (Admin only)' })
  reject(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.disputesService.reject(id);
  }
}