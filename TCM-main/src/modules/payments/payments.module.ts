import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LedgerModule } from '../ledger/ledger.module';
import { PaymentPolicyService } from './payments-policy.service';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [PaymentsService, PaymentPolicyService],
  exports: [PaymentsService, PaymentPolicyService],
})
export class PaymentsModule {}

