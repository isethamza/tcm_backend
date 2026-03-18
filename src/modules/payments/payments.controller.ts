import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /* ======================================================
     CREATE CHECKOUT SESSION
  ====================================================== */
  @Post(':id/pay')
  @ApiOperation({ summary: 'Create checkout session' })
  createCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.payments.createCheckoutSession(
      id,
      req.user.id,
    );
  }

  /* ======================================================
     STRIPE PAYMENT INTENT
  ====================================================== */
  @Post('stripe/:bookingId')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createStripe(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: AuthRequest,
  ) {
    return this.payments.createStripePaymentIntent(
      bookingId,
      req.user.id,
    );
  }

  /* ======================================================
     CASH PAYMENT
  ====================================================== */
  @Post('cash/:bookingId')
  @ApiOperation({ summary: 'Create cash payment' })
  createCash(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: AuthRequest,
  ) {
    return this.payments.createCashPayment(
      bookingId,
      req.user.id,
    );
  }
}