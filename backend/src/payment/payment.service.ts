import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as Midtrans from 'midtrans-client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private snap: any;
  private midtranxSupabase: any;
  private orderSequenceCache = { date: '', lastSequence: 0 };

  constructor(private prisma: PrismaService) {
    this.snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    this.midtranxSupabase = createClient(
      process.env.MIDTRANX_URL || '',
      process.env.MIDTRANX_SERVICE_KEY || '',
    );
  }

  generateCustomOrderId(lastOrderNumber?: number): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const nextOrderNumber = lastOrderNumber ? lastOrderNumber + 1 : 1;
    const sequenceStr = String(nextOrderNumber).padStart(3, '0');
    return `22MART-${dateStr}-${sequenceStr}`;
  }

  async createTransaction(data: {
    userId: string;
    addressId: string;
    notes?: string;
    idempotencyKey: string;
    promoCode?: string;
  }) {
    // Idempotency check
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      include: { items: true },
    });

    if (existing) {
      return {
        order: existing,
        token: existing.snapToken,
        redirectUrl: null,
      };
    }

    // Get cart items
    const rawCart = await this.prisma.cartItem.findMany({
      where: { userId: data.userId },
      include: { product: true },
    });

    if (rawCart.length === 0) {
      throw new BadRequestException('Keranjang kosong');
    }

    // No limit on distinct products; use all items in cart
    const cart = rawCart;

    // Get address
    const address = await this.prisma.address.findFirst({
      where: { id: data.addressId, userId: data.userId },
    });

    if (!address) {
      throw new BadRequestException('Alamat tidak ditemukan');
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Validate minimum purchase for delivery (min 20,000)
    const MIN_DELIVERY_TOTAL = 20000;
    if (subtotal < MIN_DELIVERY_TOTAL) {
      throw new BadRequestException(`Minimum pembelian untuk pengiriman adalah Rp${MIN_DELIVERY_TOTAL.toLocaleString('id-ID')}. Total belanja kamu saat ini Rp${subtotal.toLocaleString('id-ID')}.`);
    }

    // Validate total purchase amount (max 130,000)
    const MAX_TOTAL = 130000; // in Rupiah
    if (subtotal > MAX_TOTAL) {
      throw new BadRequestException(`Total pembelian (${subtotal}) melebihi batas maksimum ${MAX_TOTAL}`);
    }
    
    // Apply promo if provided
    let discount = 0;
    if (data.promoCode) {
      const promo = await this.prisma.promo.findUnique({
        where: { code: data.promoCode.toUpperCase() },
      });

      if (promo && promo.isActive) {
        const now = new Date();
        if (now >= promo.startDate && now <= promo.endDate) {
          if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
            // Check per-user limit
            let userAlreadyUsed = false;
            if (promo.perUserLimit > 0) {
              const userUsage = await this.prisma.promoUsage.findUnique({
                where: { userId_promoId: { userId: data.userId, promoId: promo.id } },
              });
              if (userUsage) userAlreadyUsed = true;
            }

            if (!userAlreadyUsed && subtotal >= promo.minPurchase) {
              if (promo.discountType === 'PERCENTAGE') {
                discount = Math.floor(subtotal * promo.discountValue / 100);
                if (promo.maxDiscount && discount > promo.maxDiscount) {
                  discount = promo.maxDiscount;
                }
              } else {
                discount = promo.discountValue;
              }
              if (discount > subtotal) discount = subtotal;

              // Increment usage + record per-user
              await this.prisma.promo.update({
                where: { id: promo.id },
                data: { usedCount: { increment: 1 } },
              });
              await this.prisma.promoUsage.upsert({
                where: { userId_promoId: { userId: data.userId, promoId: promo.id } },
                create: { userId: data.userId, promoId: promo.id },
                update: {},
              });
            }
          }
        }
      }
    }

    const total = Math.max(subtotal - discount, 1); // Midtrans minimum 1

    // Generate order ID
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // In-memory atomic cache optimization (global sequence)
    if (this.orderSequenceCache.lastSequence === 0) {
      const lastOrder = await this.prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { orderId: true },
      });

      let lastOrderNumber = 0;
      if (lastOrder && lastOrder.orderId) {
        const parts = lastOrder.orderId.split('-');
        if (parts.length === 3) {
          const parsedSeq = parseInt(parts[2], 10);
          if (!isNaN(parsedSeq)) lastOrderNumber = parsedSeq;
        }
      }
      this.orderSequenceCache = { date: dateStr, lastSequence: lastOrderNumber };
    }

    this.orderSequenceCache.lastSequence += 1;
    const orderId = `22MART-${dateStr}-${String(this.orderSequenceCache.lastSequence).padStart(3, '0')}`;

    // Get user
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    // Create Midtrans transaction
    const transactionPayload: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
      customer_details: {
        email: user?.email,
        first_name: user?.name,
        phone: address.phone,
        shipping_address: {
          first_name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          postal_code: address.postalCode,
        },
      },
    };

    // Only include item_details when no discount (Midtrans doesn't support negative prices)
    if (discount === 0) {
      transactionPayload.item_details = cart.map((item) => ({
        id: item.productId,
        name: item.product.name.substring(0, 50),
        price: item.product.price,
        quantity: item.quantity,
      }));
    }

    const transaction = await this.snap.createTransaction(transactionPayload);

    // Create order in DB
    const shippingAddress = `${address.address}, ${address.village}, ${address.district}, ${address.city}, ${address.province}, ${address.postalCode}`;

    const order = await this.prisma.order.create({
      data: {
        orderId,
        idempotencyKey: data.idempotencyKey,
        subtotal,
        discount,
        promoCode: discount > 0 ? (data.promoCode || null) : null,
        total,
        shippingName: address.name,
        shippingPhone: address.phone,
        shippingAddress,
        notes: data.notes,
        snapToken: transaction.token,
        userId: data.userId,
        items: {
          create: cart.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
            productId: item.productId,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Kurangi stok produk
    for (const item of cart) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId: data.userId } });

    return {
      order,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  async getPaymentStatus(orderId: string) {
    const { data, error } = await this.midtranxSupabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return { found: false, status: 'not_found' };
    }

    const isSuccess =
      data.status === 'settlement' ||
      (data.status === 'capture' && data.fraud_status === 'accept');

    return {
      found: true,
      status: data.status,
      isSuccess,
      amount: data.gross_amount,
      paymentType: data.payment_type,
      paidAt: data.processed_at,
    };
  }

  async updateOrderPayment(orderId: string) {
    const status = await this.getPaymentStatus(orderId);

    if (status.found && status.isSuccess) {
      await this.prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus: 'settlement',
          paymentType: status.paymentType,
        },
      });
    }

    return status;
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderByOrderId(orderId: string) {
    return this.prisma.order.findUnique({
      where: { orderId },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateOrderStatus(orderId: string, status: 'DIPROSES' | 'DIKIRIM' | 'SELESAI') {
    return this.prisma.order.update({
      where: { orderId },
      data: { status },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    });
  }
}
