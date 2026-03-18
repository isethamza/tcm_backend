"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async me(userId) {
        if (!userId) {
            throw new common_1.UnauthorizedException();
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
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === client_1.UserStatus.PENDING) {
            throw new common_1.ForbiddenException('Account not verified');
        }
        if (user.status === client_1.UserStatus.SUSPENDED ||
            user.deletedAt) {
            throw new common_1.ForbiddenException('Account disabled');
        }
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
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
    async register(dto) {
        if (!dto.email || !dto.password || !dto.role) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                role: dto.role,
                status: client_1.UserStatus.PENDING,
            },
        });
        const token = (0, crypto_1.randomUUID)();
        await this.prisma.emailVerification.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        });
        console.log(`Verify email: http://localhost:3000/auth/verify-email?token=${token}`);
        return {
            message: 'Registration successful. Please verify your email.',
        };
    }
    async verifyEmail(token) {
        if (!token) {
            throw new common_1.BadRequestException('Verification token is required');
        }
        const record = await this.prisma.emailVerification.findUnique({
            where: { token },
        });
        if (!record) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token expired');
        }
        await this.prisma.user.update({
            where: { id: record.userId },
            data: { status: client_1.UserStatus.ACTIVE },
        });
        await this.prisma.emailVerification.delete({
            where: { id: record.id },
        });
        return {
            message: 'Email verified successfully. You can now log in.',
        };
    }
    async forgotPassword(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If the email exists, a reset link was sent',
            };
        }
        const token = (0, crypto_1.randomUUID)();
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 30),
            },
        });
        console.log(`Reset password: http://localhost:3002/en/reset-password?token=${token}`);
        return {
            message: 'If the email exists, a reset link was sent',
        };
    }
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new common_1.BadRequestException('Invalid request');
        }
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!record ||
            record.usedAt ||
            record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired token');
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
    async issueTokens(user) {
        const accessToken = this.jwt.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        const refreshToken = (0, crypto_1.randomUUID)();
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!record ||
            record.revokedAt ||
            record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.issueTokens(record.user);
        return {
            access_token: tokens.accessToken,
        };
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            return { message: 'Logged out' };
        }
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
        return { message: 'Logged out' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map