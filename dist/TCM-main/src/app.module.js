"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const booking_docs_module_1 = require("./modules/bookings/booking-docs.module");
const payments_module_1 = require("./modules/payments/payments.module");
const ledger_module_1 = require("./modules/ledger/ledger.module");
const pickup_module_1 = require("./modules/pickup/pickup.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const disputes_module_1 = require("./modules/disputes/disputes.module");
const audit_module_1 = require("./modules/audit/audit.module");
const platform_express_1 = require("@nestjs/platform-express");
const recipients_module_1 = require("./modules/recipients/recipients.module");
const trips_module_1 = require("./modules/trips/trips.module");
const pricing_module_1 = require("./modules/pricing/pricing.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const admin_module_1 = require("./modules/admin/admin.module");
const hub_module_1 = require("./modules/hub/hub.module");
const tripstop_module_1 = require("./modules/tripstop/tripstop.module");
const insurance_module_1 = require("./modules/insurance/insurance.module");
const plans_module_1 = require("./modules/insurance/plans/plans.module");
const rating_module_1 = require("./modules/rating/rating.module");
const pickup_scheduling_module_1 = require("./modules/pickup-scheduling/pickup-scheduling.module");
const handover_module_1 = require("./modules/handover/handover.module");
const handover_token_module_1 = require("./modules/handover/handover-token.module");
const handover_batch_module_1 = require("./modules/handover-batch/handover-batch.module");
const mail_module_1 = require("./modules/mail/mail.module");
const pickup_routing_module_1 = require("./modules/pickup-routing/pickup-routing.module");
const delivery_routing_module_1 = require("./modules/delivery-routing/delivery-routing.module");
const route_manifest_module_1 = require("./modules/route-manifest/route-manifest.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            recipients_module_1.RecipientsModule,
            trips_module_1.TripsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            kyc_module_1.KycModule,
            disputes_module_1.DisputesModule,
            bookings_module_1.BookingsModule,
            booking_docs_module_1.BookingDocsModule,
            payments_module_1.PaymentsModule,
            ledger_module_1.LedgerModule,
            pickup_module_1.PickupModule,
            pricing_module_1.PricingModule,
            audit_module_1.AuditModule,
            uploads_module_1.UploadsModule,
            admin_module_1.AdminModule,
            hub_module_1.HubModule,
            tripstop_module_1.TripStopModule,
            insurance_module_1.InsuranceModule,
            plans_module_1.PlansModule,
            rating_module_1.RatingModule,
            pickup_scheduling_module_1.PickupSchedulingModule,
            handover_module_1.HandoverModule,
            handover_token_module_1.HandoverTokenModule,
            handover_batch_module_1.HandoverBatchModule,
            mail_module_1.MailModule,
            pickup_routing_module_1.PickupRoutingModule,
            route_manifest_module_1.RouteManifestModule,
            delivery_routing_module_1.DeliveryRoutingModule
        ]
    })
], AppModule);
platform_express_1.MulterModule.register({
    dest: './uploads',
});
//# sourceMappingURL=app.module.js.map