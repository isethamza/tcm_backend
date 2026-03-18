import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email?: string;
    role?: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================
  // LOGIN (SET HTTP-ONLY COOKIE)
  // =========================
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and set HTTP-only cookie' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123',
      },
    },
  })
  async login(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
    };
  }

  // =========================
  // REGISTER
  // =========================
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123',
        role: 'CLIENT',
      },
    },
  })
  register(
    @Body()
    dto: {
      email: string;
      password: string;
      role: 'CLIENT' | 'TRANSPORTEUR' | 'HUB_MANAGER' | 'RECIPIENT';
    },
  ) {
    return this.authService.register(dto);
  }

  // =========================
  // LOGOUT
  // =========================
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (clear cookie)' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    return { success: true };
  }

  // =========================
  // CURRENT USER
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Req() req: AuthRequest) {
    return req.user;
  }

  // =========================
  // EMAIL VERIFICATION
  // =========================
  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email using token' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // =========================
  // PASSWORD RESET
  // =========================
  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
      },
    },
  })
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({
    schema: {
      example: {
        token: 'reset-token',
        password: 'newPassword123',
      },
    },
  })
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}