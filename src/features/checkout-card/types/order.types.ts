// src/features/order/types/order.types.ts

import { Address } from './address.types';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    DELIVERING = 'DELIVERING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED'
}

export interface OrderItemDTO {
    id: number;
    dishId: number;
    dishName: string;
    dishImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderResponse {
    // Order info
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: 'COD' | 'CARD';
    paymentStatus: PaymentStatus;

    // Merchant
    merchantId: number;
    merchantName: string;
    merchantAddress: string;
    merchantPhone: string;

    // Shipping
    shippingAddress: Address;

    // Items
    items: OrderItemDTO[];
    totalItems: number;

    // Prices
    itemsTotal: number;
    discountAmount: number;
    serviceFee: number;
    shippingFee: number;
    totalAmount: number;

    // Coupon
    couponCode: string | null;

    // Meta
    notes: string | null;
    orderDate: string;
    expectedDeliveryTime: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
}