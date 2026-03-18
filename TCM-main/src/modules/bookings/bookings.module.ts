
import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsController } from './bookings.controller';
import { BookingDocsController } from './booking-docs.controller';
import { PricingModule } from '../pricing/pricing.module';
import { MailModule } from '../mail/mail.module';
import { BookingMailService } from './booking-mail.service';
import { BookingDocsService } from './booking-docs.service';
import { PaymentPolicyService } from '../payments/payments-policy.service'; 
import { PaymentsModule } from '../payments/payments.module';
import { GeoModule } from '../geo/geo.module';
import { AuditModule } from '../audit/audit.module';

@Module({
   imports: [ PricingModule, MailModule, PaymentsModule, GeoModule,AuditModule,],
    controllers: [BookingsController, BookingDocsController,],
	providers: [PrismaService,BookingsService, BookingDocsService, BookingMailService ],
	exports: [BookingMailService, BookingsService, BookingDocsService, PrismaService],
})
export class BookingsModule {}

