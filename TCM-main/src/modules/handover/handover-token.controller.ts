import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HandoverTokenService } from './handover-token.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScanQRCodeDto } from './dto/scan-qr.dto';

interface AuthRequest extends Request {
  user: { id: string; role: UserRole };
}

@ApiTags('QR Handover')
@ApiBearerAuth()
@Controller('handover/qr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTEUR, UserRole.RECIPIENT, UserRole.HUB_MANAGER)
export class HandoverTokenController {
  constructor(private readonly service: HandoverTokenService) {}

  /* =====================================================
     SCAN QR AND CREATE HANDOVER
  ===================================================== */
  @Post('scan')
  @ApiOperation({ summary: 'Scan QR token and trigger handover event' })
  @ApiResponse({
    status: 200,
    description: 'Handover successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Unauthorized to perform handover',
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found',
  })
  scan(@Req() req: AuthRequest, @Body() dto: ScanQRCodeDto) {
    return this.service.processScan(dto.token, req.user.id);
  }
}