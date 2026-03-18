import { Controller, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { deliveryRoutingQueue } from './queue/delivery-routing.queue';
import { JOBS, JOB_PRIORITY, buildJobId, getJobOptions } from 'src/infra/queue/queue.constants';

@ApiTags('Delivery Routing - Sys internal Debug Only!')
@Controller('delivery-routing')
export class DeliveryRoutingController {
  @Post(':tripId/compute')
  @ApiOperation({ summary: 'Queue delivery route computation' })
  @ApiParam({
    name: 'tripId',
    type: String,
    description: 'Trip ID (UUID)',
  })
  @ApiResponse({
    status: 201,
    description: 'Delivery routing job queued',
  })
  async compute(
    @Param('tripId', new ParseUUIDPipe()) tripId: string,
  ) {
    const jobId = buildJobId(['delivery-route', tripId]);

    await deliveryRoutingQueue.add(
      JOBS.DELIVERY_ROUTING.COMPUTE,
      { tripId },
      getJobOptions(jobId, {
        priority: JOB_PRIORITY.NORMAL,
      }),
    );

    return {
      success: true,
      message: 'Delivery routing queued',
      jobId,
    };
  }
}