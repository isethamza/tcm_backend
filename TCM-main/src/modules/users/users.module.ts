
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileController } from './profile.controller';
import { InfraModule } from 'src/infra/infra.module';

@Module({
  imports: [InfraModule], 
  controllers: [UsersController, ProfileController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}