import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BookingDocsModule } from './modules/bookings/booking-docs.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PickupModule } from './modules/pickup/pickup.module';
import { KycModule } from './modules/kyc/kyc.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AuditModule } from './modules/audit/audit.module';
import { MulterModule } from '@nestjs/platform-express';
import { RecipientsModule } from './modules/recipients/recipients.module';
import { TripsModule } from './modules/trips/trips.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AdminModule } from './modules/admin/admin.module';
import { HubModule } from './modules/hub/hub.module';
import { TripStopModule } from './modules/tripstop/tripstop.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { PlansModule } from './modules/insurance/plans/plans.module';
import { RatingModule } from './modules/rating/rating.module';
import { PickupSchedulingModule } from './modules/pickup-scheduling/pickup-scheduling.module';
import { HandoverModule } from './modules/handover/handover.module';
import { HandoverTokenModule } from './modules/handover/handover-token.module';
import { HandoverBatchModule } from './modules/handover-batch/handover-batch.module';
import { MailModule } from './modules/mail/mail.module';
import { PickupRoutingModule } from './modules/pickup-routing/pickup-routing.module';
import { DeliveryRoutingModule } from './modules/delivery-routing/delivery-routing.module';
import { RouteManifestModule } from './modules/route-manifest/route-manifest.module';

@Module({
  imports: [
	PrismaModule,      // GLOBAL DB PROVIDER
    RecipientsModule,
	TripsModule,
	AuthModule,
    UsersModule,
    KycModule,
	DisputesModule,
	BookingsModule,
	BookingDocsModule,
    PaymentsModule,
    LedgerModule,
    PickupModule,
	PricingModule,
	AuditModule,
	UploadsModule,
	AdminModule,
	HubModule,
	TripStopModule,
	InsuranceModule,
	PlansModule,
	RatingModule,
	PickupSchedulingModule,
	HandoverModule,
	HandoverTokenModule,
	HandoverBatchModule,
	MailModule,
	PickupRoutingModule,
	RouteManifestModule,
	DeliveryRoutingModule
	
  ]
})

export class AppModule {}

MulterModule.register({
  dest: './uploads',
});
