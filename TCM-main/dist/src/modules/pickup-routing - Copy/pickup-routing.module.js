"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRoutingModule = void 0;
const common_1 = require("@nestjs/common");
const pickup_routing_controller_1 = require("./pickup-routing.controller");
const pickup_routing_service_1 = require("./pickup-routing.service");
let PickupRoutingModule = class PickupRoutingModule {
};
exports.PickupRoutingModule = PickupRoutingModule;
exports.PickupRoutingModule = PickupRoutingModule = __decorate([
    (0, common_1.Module)({
        controllers: [pickup_routing_controller_1.PickupRoutingController],
        providers: [pickup_routing_service_1.PickupRoutingService],
        exports: [pickup_routing_service_1.PickupRoutingService],
    })
], PickupRoutingModule);
//# sourceMappingURL=pickup-routing.module.js.map