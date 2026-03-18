import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}