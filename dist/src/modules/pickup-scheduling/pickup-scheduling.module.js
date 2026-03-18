"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupSchedulingModule = void 0;
const common_1 = require("@nestjs/common");
const pickup_scheduling_service_1 = require("./pickup-scheduling.service");
const pickup_scheduling_controller_1 = require("./pickup-scheduling.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
const pickup_routing_module_1 = require("../pickup-routing/pickup-routing.module");
const audit_module_1 = require("../audit/audit.module");
const booking_mail_module_1 = require("../bookings/booking-mail.module");
let PickupSchedulingModule = class PickupSchedulingModule {
};
exports.PickupSchedulingModule = PickupSchedulingModule;
exports.PickupSchedulingModule = PickupSchedulingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            pickup_routing_module_1.PickupRoutingModule,
            audit_module_1.AuditModule,
            booking_mail_module_1.BookingMailModule,
        ],
        controllers: [pickup_scheduling_controller_1.PickupSchedulingController],
        providers: [pickup_scheduling_service_1.PickupSchedulingService, prisma_service_1.PrismaService],
    })
], PickupSchedulingModule);
//# sourceMappingURL=pickup-scheduling.module.js.map