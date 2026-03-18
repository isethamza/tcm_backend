import {
  Controller,
  Post,
  Req,
  HttpCode,
  BadRequestException,
  Headers,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from '../payments/payments.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Payment Stripe Webhooks')
@Public()
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @ApiExcludeEndpoint() // ✅ FIXED POSITION
  @HttpCode(200)
  async handle(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      this.logger.error('Stripe signature verification failed', err);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const intent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`Payment succeeded: ${intent.id}`);
          await this.payments.confirmStripePayment(intent.id);
          break;
        }

        case 'payment_intent.payment_failed': {
          const intent = event.data.object as Stripe.PaymentIntent;
          this.logger.warn(`Payment failed: ${intent.id}`);
          await this.payments.handleFailedPayment(intent.id); 
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          this.logger.log(`Charge refunded: ${charge.id}`);
          await this.payments.handleRefund(charge.payment_intent as string); 
          break;
        }

        default:
          this.logger.debug(`Unhandled event: ${event.type}`);
          break;
      }
    } catch (err) {
      this.logger.error(`Webhook handling failed: ${event.type}`, err);
      return { received: true };
    }

    return { received: true };
  }
}