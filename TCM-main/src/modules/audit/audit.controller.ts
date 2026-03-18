import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/audit')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'List audit logs (Admin only)',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action type',
    example: 'CREATE_BOOKING',
  })
  @ApiQuery({
    name: 'entity',
    required: false,
    description: 'Filter by entity name',
    example: 'BOOKING',
  })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  async list(
    @Req() req: { user: { role: string } },
    @Query('action') action?: string,
    @Query('entity') entity?: string,
  ) {
    if (req.user.role !== 'ADMIN') return [];

    return this.prisma.auditLog.findMany({
      where: {
        ...(action && { action: action as any }),
        ...(entity && { entity }),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        actor: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }
}