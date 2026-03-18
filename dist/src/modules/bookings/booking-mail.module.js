"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMailModule = void 0;
const common_1 = require("@nestjs/common");
const booking_mail_service_1 = require("./booking-mail.service");
const booking_docs_service_1 = require("./booking-docs.service");
const mail_module_1 = require("../mail/mail.module");
let BookingMailModule = class BookingMailModule {
};
exports.BookingMailModule = BookingMailModule;
exports.BookingMailModule = BookingMailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mail_module_1.MailModule,
        ],
        providers: [
            booking_mail_service_1.BookingMailService,
            booking_docs_service_1.BookingDocsService,
        ],
        exports: [
            booking_mail_service_1.BookingMailService,
        ],
    })
], BookingMailModule);
//# sourceMappingURL=booking-mail.module.js.map