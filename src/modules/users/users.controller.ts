import {
  Controller,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
    email?: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // ADMIN — Get all users
  // =========================
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  findAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.usersService.findAll();
  }

  // =========================
  // CURRENT USER
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  me(@Req() req: AuthRequest) {
    return req.user;
  }
}