import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
async findAll() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
    orderBy: { email: 'asc' },
  });
}

  async createHubManager(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'HUB_MANAGER',
        status: 'ACTIVE',
      },
    });

    // ✅ CREATE KYC
    await this.prisma.kyc.create({
      data: {
        userId: createdUser.id,
        type: 'HUB_MANAGER',
        status: 'PENDING',
      },
    });

    return createdUser;
  }
}
