// src/features/checkout/types/checkout.types.ts

import { Address } from './address.types';

export interface CartItemDTO {
    id: number;
    dishId: number;
    dishName: string;
    dishImage: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    discountPrice: number;
}

export interface CouponInfo {
    id: number;
    code: string;
    description: string;
    discountValue: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    minOrderValue: number;
}

export interface CheckoutResponse {
    merchantId: number;
    merchantName: string;
    merchantAddress: string;
    merchantPhone: string;

    // Cart items
    items: CartItemDTO[];
    totalItems: number;

    // Addresses
    addresses: Address[];
    defaultAddressId: number | null;

    // Price calculation
    itemsTotal: number;
    discountAmount: number;
    serviceFee: number;
    shippingFee: number;
    totalAmount: number;

    // Coupon
    appliedCouponCode: string | null;
    canUseCoupon: boolean;
    availableCoupons: CouponInfo[];

    // Notes
    notes?: string;
}

export interface CheckoutRequest {
    addressId: number;
    paymentMethod: 'COD' | 'CARD';
    couponCode?: string;
    notes?: string;
}

export enum PaymentMethod {
    COD = 'COD',
    CARD = 'CARD'
}