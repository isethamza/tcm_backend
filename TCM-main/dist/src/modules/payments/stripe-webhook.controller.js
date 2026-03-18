"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stripe_1 = require("stripe");
const payments_service_1 = require("../payments/payments.service");
const public_decorator_1 = require("../auth/public.decorator");
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    constructor(payments) {
        this.payments = payments;
        this.logger = new common_1.Logger(StripeWebhookController_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async handle(req, signature) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing Stripe signature');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            this.logger.error('Stripe signature verification failed', err);
            throw new common_1.BadRequestException('Invalid Stripe webhook signature');
        }
        try {
            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const intent = event.data.object;
                    this.logger.log(`Payment succeeded: ${intent.id}`);
                    await this.payments.confirmStripePayment(intent.id);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const intent = event.data.object;
                    this.logger.warn(`Payment failed: ${intent.id}`);
                    await this.payments.handleFailedPayment(intent.id);
                    break;
                }
                case 'charge.refunded': {
                    const charge = event.data.object;
                    this.logger.log(`Charge refunded: ${charge.id}`);
                    await this.payments.handleRefund(charge.payment_intent);
                    break;
                }
                default:
                    this.logger.debug(`Unhandled event: ${event.type}`);
                    break;
            }
        }
        catch (err) {
            this.logger.error(`Webhook handling failed: ${event.type}`, err);
            return { received: true };
        }
        return { received: true };
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handle", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payment Stripe Webhooks'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('webhooks/stripe'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map