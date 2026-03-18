import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipientsService } from './recipients.service';
import { CreateRecipientDto } from './dto/create-recipient.dto';
import { UpdateRecipientDto } from './dto/update-recipient.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Client Recipients')
@ApiBearerAuth()
@Controller('client/recipients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class RecipientsController {
  constructor(private readonly service: RecipientsService) {}

  // =========================
  // CLIENT — MY RECIPIENTS
  // =========================
  @Get()
  @ApiOperation({ summary: 'Get my recipients' })
  myRecipients(@Req() req: AuthRequest) {
    return this.service.findMyRecipients(req.user.id);
  }

  // =========================
  // CLIENT — CREATE
  // =========================
  @Post()
  @ApiOperation({ summary: 'Create recipient' })
  create(
    @Req() req: AuthRequest,
    @Body() dto: CreateRecipientDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  // =========================
  // CLIENT — UPDATE
  // =========================
  @Patch(':id')
  @ApiOperation({ summary: 'Update recipient' })
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecipientDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  // =========================
  // CLIENT — DELETE
  // =========================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete recipient' })
  remove(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(req.user.id, id);
  }
}