import { Module } from '@nestjs/common';
import { BookingMailService } from './booking-mail.service';
import { BookingDocsService } from './booking-docs.service';
import { MailModule } from '../mail/mail.module'; // ⚠️ required if used

@Module({
  imports: [
    MailModule, // ✅ REQUIRED if BookingMailService uses MailService
  ],
  providers: [
    BookingMailService,
    BookingDocsService,
  ],
  exports: [
    BookingMailService, // ✅ THIS IS CRITICAL
  ],
})
export class BookingMailModule {}