"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const bookings_controller_1 = require("./bookings.controller");
const booking_docs_controller_1 = require("./booking-docs.controller");
const pricing_module_1 = require("../pricing/pricing.module");
const mail_module_1 = require("../mail/mail.module");
const booking_mail_service_1 = require("./booking-mail.service");
const booking_docs_service_1 = require("./booking-docs.service");
const payments_module_1 = require("../payments/payments.module");
const geo_module_1 = require("../geo/geo.module");
const audit_module_1 = require("../audit/audit.module");
let BookingsModule = class BookingsModule {
};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = __decorate([
    (0, common_1.Module)({
        imports: [pricing_module_1.PricingModule, mail_module_1.MailModule, payments_module_1.PaymentsModule, geo_module_1.GeoModule, audit_module_1.AuditModule,],
        controllers: [bookings_controller_1.BookingsController, booking_docs_controller_1.BookingDocsController,],
        providers: [prisma_service_1.PrismaService, bookings_service_1.BookingsService, booking_docs_service_1.BookingDocsService, booking_mail_service_1.BookingMailService],
        exports: [booking_mail_service_1.BookingMailService, bookings_service_1.BookingsService, booking_docs_service_1.BookingDocsService, prisma_service_1.PrismaService],
    })
], BookingsModule);
//# sourceMappingURL=bookings.module.js.map