import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async getAllPlans() {
    return this.prisma.insurancePlan.findMany({
      where: { active: true },
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Plan not found');

    return plan;
  }
}