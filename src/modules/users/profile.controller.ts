import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GeoService } from '../../infra/geo.service';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Users Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
  ) {}

  // =========================
  // Get my profile
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(@Req() req: AuthRequest) {
    return this.prisma.profile.findUnique({
      where: { userId: req.user.id },
    });
  }

  // =========================
  // Create or update my profile
  // =========================
  @Patch('me')
  @ApiOperation({ summary: 'Create or update my profile' })
  @ApiBody({
    schema: {
      example: {
        mobile: '+46700000000',
        address: 'Main Street 1',
        postalCode: '21120',
        city: 'Malmö',
        country: 'Sweden',
      },
    },
  })
  async upsertProfile(
    @Req() req: AuthRequest,
    @Body()
    dto: {
      mobile: string;
      address: string;
      postalCode: string;
      city: string;
      country: string;
    },
  ) {
    const userId = req.user.id;

    //////////////////////////////////////
    // 📍 GEOCODE ADDRESS
    //////////////////////////////////////
    let coords: { lat: number; lng: number };

    try {
      coords = await this.geoService.geocode({
        address: dto.address,
        postalCode: dto.postalCode,
        city: dto.city,
        country: dto.country,
      });
    } catch (err) {
      throw new BadRequestException(
        'Invalid address. Could not determine location.',
      );
    }

    if (coords.lat == null || coords.lng == null) {
      throw new BadRequestException('Failed to resolve coordinates');
    }

    //////////////////////////////////////
    // 💾 UPSERT PROFILE
    //////////////////////////////////////
    return this.prisma.profile.upsert({
      where: { userId },

      create: {
        ...dto,
        lat: coords.lat,
        lng: coords.lng,
        user: {
          connect: { id: userId },
        },
      },

      update: {
        ...dto,
        lat: coords.lat,
        lng: coords.lng,
      },
    });
  }
}