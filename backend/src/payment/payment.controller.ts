import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  createTransaction(
    @Body()
    body: {
      userId: string;
      addressId: string;
      notes?: string;
      idempotencyKey: string;
      promoCode?: string;
    },
  ) {
    return this.paymentService.createTransaction(body);
  }

  @Get('status/:orderId')
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.updateOrderPayment(orderId);
  }

  @Get('orders')
  getOrders(@Query('userId') userId: string, @Req() req: any) {
    const user = req.user;
    
    // If not admin, can only see own orders
    if (user.role !== 'ADMIN') {
      return this.paymentService.getOrders(user.sub);
    }
    
    // Admin can see everything, or filter by userId
    if (userId) return this.paymentService.getOrders(userId);
    return this.paymentService.getAllOrders();
  }

  @Get('orders/:orderId')
  async getOrder(@Param('orderId') orderId: string, @Req() req: any) {
    const user = req.user;
    const order = await this.paymentService.getOrderByOrderId(orderId);
    
    if (!order) return null;
    
    // If not admin and not own order, forbidden
    if (user.role !== 'ADMIN' && order.userId !== user.sub) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
    }
    
    return order;
  }

  @Patch('orders/:orderId/status')
  @Roles('ADMIN')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: 'DIPROSES' | 'DIKIRIM' | 'SELESAI',
  ) {
    return this.paymentService.updateOrderStatus(orderId, status);
  }
}
