"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteManifestModule = void 0;
const common_1 = require("@nestjs/common");
const route_manifest_service_1 = require("./route-manifest.service");
const route_manifest_controller_1 = require("./route-manifest.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
let RouteManifestModule = class RouteManifestModule {
};
exports.RouteManifestModule = RouteManifestModule;
exports.RouteManifestModule = RouteManifestModule = __decorate([
    (0, common_1.Module)({
        providers: [route_manifest_service_1.RouteManifestService, prisma_service_1.PrismaService],
        controllers: [route_manifest_controller_1.RouteManifestController],
    })
], RouteManifestModule);
//# sourceMappingURL=route-manifest.module.js.map