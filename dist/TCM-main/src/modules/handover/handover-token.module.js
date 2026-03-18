"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandoverTokenModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const handover_service_1 = require("./handover.service");
const handover_token_service_1 = require("./handover-token.service");
const handover_token_controller_1 = require("./handover-token.controller");
let HandoverTokenModule = class HandoverTokenModule {
};
exports.HandoverTokenModule = HandoverTokenModule;
exports.HandoverTokenModule = HandoverTokenModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [prisma_service_1.PrismaService, handover_service_1.HandoverService, handover_token_service_1.HandoverTokenService],
        controllers: [handover_token_controller_1.HandoverTokenController],
        exports: [handover_token_service_1.HandoverTokenService],
    })
], HandoverTokenModule);
//# sourceMappingURL=handover-token.module.js.map