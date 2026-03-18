"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRoutingModule = void 0;
const common_1 = require("@nestjs/common");
const delivery_routing_service_1 = require("./delivery-routing.service");
const delivery_routing_controller_1 = require("./delivery-routing.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
let DeliveryRoutingModule = class DeliveryRoutingModule {
};
exports.DeliveryRoutingModule = DeliveryRoutingModule;
exports.DeliveryRoutingModule = DeliveryRoutingModule = __decorate([
    (0, common_1.Module)({
        providers: [delivery_routing_service_1.DeliveryRoutingService, prisma_service_1.PrismaService],
        controllers: [delivery_routing_controller_1.DeliveryRoutingController],
        exports: [delivery_routing_service_1.DeliveryRoutingService],
    })
], DeliveryRoutingModule);
//# sourceMappingURL=delivery-routing.module.js.map