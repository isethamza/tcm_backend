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
exports.DeliveryRoutingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const delivery_routing_queue_1 = require("./queue/delivery-routing.queue");
const queue_constants_1 = require("../../infra/queue/queue.constants");
let DeliveryRoutingController = class DeliveryRoutingController {
    async compute(tripId) {
        const jobId = (0, queue_constants_1.buildJobId)(['delivery-route', tripId]);
        await delivery_routing_queue_1.deliveryRoutingQueue.add(queue_constants_1.JOBS.DELIVERY_ROUTING.COMPUTE, { tripId }, (0, queue_constants_1.getJobOptions)(jobId, {
            priority: queue_constants_1.JOB_PRIORITY.NORMAL,
        }));
        return {
            success: true,
            message: 'Delivery routing queued',
            jobId,
        };
    }
};
exports.DeliveryRoutingController = DeliveryRoutingController;
__decorate([
    (0, common_1.Post)(':tripId/compute'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue delivery route computation' }),
    (0, swagger_1.ApiParam)({
        name: 'tripId',
        type: String,
        description: 'Trip ID (UUID)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Delivery routing job queued',
    }),
    __param(0, (0, common_1.Param)('tripId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryRoutingController.prototype, "compute", null);
exports.DeliveryRoutingController = DeliveryRoutingController = __decorate([
    (0, swagger_1.ApiTags)('Delivery Routing - Sys internal Debug Only!'),
    (0, common_1.Controller)('delivery-routing')
], DeliveryRoutingController);
//# sourceMappingURL=delivery-routing.controller.js.map