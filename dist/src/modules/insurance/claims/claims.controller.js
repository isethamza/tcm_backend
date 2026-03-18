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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const claims_service_1 = require("./claims.service");
const submit_claim_dto_1 = require("../dto/submit-claim.dto");
const review_claim_dto_1 = require("../dto/review-claim.dto");
const query_claims_dto_1 = require("../dto/query-claims.dto");
let ClaimsController = class ClaimsController {
    constructor(service) {
        this.service = service;
    }
    submit(dto) {
        return this.service.submitClaim(dto);
    }
    updateStatus(id, dto) {
        return this.service.updateStatus(id, dto);
    }
    getClaims(query) {
        return this.service.getClaims(query);
    }
    getClaim(id) {
        return this.service.getClaim(id);
    }
};
exports.ClaimsController = ClaimsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit insurance claim' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_claim_dto_1.SubmitClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "submit", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update claim status (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_claim_dto_1.ReviewClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List claims with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_claims_dto_1.QueryClaimsDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "getClaims", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get claim details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "getClaim", null);
exports.ClaimsController = ClaimsController = __decorate([
    (0, swagger_1.ApiTags)('Insurance Claims'),
    (0, common_1.Controller)('claims'),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], ClaimsController);
//# sourceMappingURL=claims.controller.js.map