import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Post,
  UseGuards,
  Body,
  UploadedFiles,
  UseInterceptors,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycService } from './kyc.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('KYC - Know Your Customer')
@ApiBearerAuth()
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly prisma: PrismaService,
  ) {}

  // =========================
  // Submit KYC
  // =========================
  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC documents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 3))
  submit(
    @Req() req: AuthRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.kycService.submit(req.user.id, files);
  }

  // =========================
  // Get my KYC status
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get my KYC status' })
  async me(@Req() req: AuthRequest) {
    const kyc = await this.prisma.kyc.findFirst({
      where: { userId: req.user.id },
      select: {
        id: true,
        type: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return kyc ?? null;
  }

  // =========================
  // Admin — list pending KYCs
  // =========================
  @Get('pending')
  @ApiOperation({ summary: 'List pending KYCs (Admin only)' })
  findPending(@Req() req: AuthRequest) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.kycService.findPending();
  }

  // =========================
  // Admin — approve KYC
  // =========================
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve KYC (Admin only)' })
  approve(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) kycId: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.kycService.approve(kycId, req.user.id);
  }

  // =========================
  // Admin — reject KYC
  // =========================
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject KYC (Admin only)' })
  reject(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) kycId: string,
    @Body('reason') reason: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.kycService.reject(kycId, req.user.id, reason);
  }
}