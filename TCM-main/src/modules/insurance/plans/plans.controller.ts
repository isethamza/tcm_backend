import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Insurance Plans')
@Controller('insurance/plans')
export class PlansController {
  constructor(private readonly service: PlansService) {}

  @Get()
  getPlans() {
    return this.service.getAllPlans();
  }

  @Get(':id')
  getPlan(@Param('id') id: string) {
    return this.service.getPlan(id);
  }
}