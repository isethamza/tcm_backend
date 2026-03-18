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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const bookings_service_1 = require("./bookings.service");
const pricing_service_1 = require("../pricing/pricing.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const preview_price_dto_1 = require("./dto/preview-price.dto");
const swagger_1 = require("@nestjs/swagger");
let BookingsController = class BookingsController {
    constructor(bookings, pricingService) {
        this.bookings = bookings;
        this.pricingService = pricingService;
    }
    preview(dto) {
        return this.pricingService.preview(dto);
    }
    create(req, dto) {
        return this.bookings.create(req.user.id, dto);
    }
    myBookings(req) {
        return this.bookings.myBookings(req.user.id);
    }
    getOne(req, id) {
        return this.bookings.getBooking(id, req.user);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)('preview-price'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Preview booking pricing' }),
    (0, swagger_1.ApiBody)({ type: preview_price_dto_1.PreviewPriceDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing calculated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [preview_price_dto_1.PreviewPriceDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking' }),
    (0, swagger_1.ApiBody)({ type: create_booking_dto_1.CreateBookingDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get my bookings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of bookings' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "myBookings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        description: 'Booking ID',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getOne", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        pricing_service_1.PricingService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map