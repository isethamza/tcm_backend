"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceModule = void 0;
const common_1 = require("@nestjs/common");
const insurance_service_1 = require("./insurance.service");
const insurance_controller_1 = require("./insurance.controller");
const claims_service_1 = require("./claims/claims.service");
const claims_controller_1 = require("./claims/claims.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
let InsuranceModule = class InsuranceModule {
};
exports.InsuranceModule = InsuranceModule;
exports.InsuranceModule = InsuranceModule = __decorate([
    (0, common_1.Module)({
        controllers: [insurance_controller_1.InsuranceController, claims_controller_1.ClaimsController],
        providers: [insurance_service_1.InsuranceService, claims_service_1.ClaimsService, prisma_service_1.PrismaService],
        exports: [insurance_service_1.InsuranceService],
    })
], InsuranceModule);
//# sourceMappingURL=insurance.module.js.map