import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipientDto } from './dto/create-recipient.dto';


@Injectable()
export class RecipientsService {
  constructor(private readonly prisma: PrismaService) {}

  findMyRecipients(clientId: string) {
    return this.prisma.recipient.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(clientId: string, dto: any) {
    return this.prisma.recipient.create({
      data: {
        clientId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        postalCode: dto.postalCode,
      },
    });
  }

  async update(clientId: string, id: string, dto: any) {
    const recipient = await this.prisma.recipient.findUnique({ where: { id } });

    if (!recipient || recipient.clientId !== clientId) {
      throw new ForbiddenException();
    }

    return this.prisma.recipient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(clientId: string, id: string) {
    const recipient = await this.prisma.recipient.findUnique({ where: { id } });

    if (!recipient || recipient.clientId !== clientId) {
      throw new ForbiddenException();
    }

    return this.prisma.recipient.delete({ where: { id } });
  }
}
