import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // =========================
  // ME
  // =========================

  async me(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  // =========================
  // LOGIN
  // =========================

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Account not verified');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.deletedAt
    ) {
      throw new ForbiddenException('Account disabled');
    }

    const valid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ use unified token issuing
    const tokens = await this.issueTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  // =========================
  // REGISTER
  // =========================

  async register(dto: {
    email: string;
    password: string;
    role: UserRole;
  }) {
    if (!dto.email || !dto.password || !dto.role) {
      throw new BadRequestException(
        'Missing required fields',
      );
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException(
        'Email already registered',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: dto.role,
        status: UserStatus.PENDING,
      },
    });

    const token = randomUUID();

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24,
        ),
      },
    });

    console.log(
      `Verify email: http://localhost:3000/auth/verify-email?token=${token}`,
    );

    return {
      message:
        'Registration successful. Please verify your email.',
    };
  }

  // =========================
  // VERIFY EMAIL
  // =========================

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException(
        'Verification token is required',
      );
    }

    const record =
      await this.prisma.emailVerification.findUnique({
        where: { token },
      });

    if (!record) {
      throw new BadRequestException(
        'Invalid or expired token',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { status: UserStatus.ACTIVE },
    });

    await this.prisma.emailVerification.delete({
      where: { id: record.id },
    });

    return {
      message:
        'Email verified successfully. You can now log in.',
    };
  }

  // =========================
  // FORGOT PASSWORD
  // =========================

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'If the email exists, a reset link was sent',
      };
    }

    const token = randomUUID();

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 30,
        ),
      },
    });

    console.log(
      `Reset password: http://localhost:3002/en/reset-password?token=${token}`,
    );

    return {
      message:
        'If the email exists, a reset link was sent',
    };
  }

  // =========================
  // RESET PASSWORD
  // =========================

  async resetPassword(
    token: string,
    newPassword: string,
  ) {
    if (!token || !newPassword) {
      throw new BadRequestException('Invalid request');
    }

    const record =
      await this.prisma.passwordResetToken.findUnique({
        where: { token },
      });

    if (
      !record ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Invalid or expired token',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password reset successfully' };
  }

  // =========================
  // ISSUE TOKENS (Unified)
  // =========================

  private async issueTokens(user: any) {
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    const refreshToken = randomUUID();

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7,
        ),
      },
    });

    return { accessToken, refreshToken };
  }

  // =========================
  // REFRESH
  // =========================

  async refresh(refreshToken: string) {
    const record =
      await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const tokens = await this.issueTokens(record.user);

    return {
      access_token: tokens.accessToken,
    };
  }

  // =========================
  // LOGOUT
  // =========================

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { message: 'Logged out' };
    }

    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out' };
  }
}
