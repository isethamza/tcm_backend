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
exports.BookingDocsController = void 0;
const common_1 = require("@nestjs/common");
const booking_docs_service_1 = require("./booking-docs.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let BookingDocsController = class BookingDocsController {
    constructor(docs) {
        this.docs = docs;
    }
    async downloadPdf(bookingId, lang = 'en', res) {
        const pdf = await this.docs.generatePdf(bookingId, lang);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="booking-${bookingId}.pdf"`);
        res.setHeader('Content-Length', pdf.length);
        return res.send(pdf);
    }
};
exports.BookingDocsController = BookingDocsController;
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download booking PDF document' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'lang',
        required: false,
        enum: ['en', 'fr'],
    }),
    (0, swagger_1.ApiProduces)('application/pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('lang')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BookingDocsController.prototype, "downloadPdf", null);
exports.BookingDocsController = BookingDocsController = __decorate([
    (0, swagger_1.ApiTags)('Booking Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [booking_docs_service_1.BookingDocsService])
], BookingDocsController);
//# sourceMappingURL=booking-docs.controller.js.map