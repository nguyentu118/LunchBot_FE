// src/features/checkout/services/checkoutService.ts

import axiosInstance from '../../../config/axiosConfig';
import { CheckoutResponse } from '../types/checkout.types';

const API_PREFIX = '/checkout';

/**
 * Checkout Service - Xử lý thanh toán
 */
// checkoutService.ts
export const checkoutService = {
    getCheckoutInfo: async (dishIds?: number[]): Promise<CheckoutResponse> => {
        const params = dishIds && dishIds.length > 0
            ? { dishIds: dishIds.join(',') }
            : {};
        const response = await axiosInstance.get<CheckoutResponse>(API_PREFIX, { params });
        return response.data;
    },

    applyCoupon: async (couponCode: string, dishIds?: number[]): Promise<CheckoutResponse> => {
        const params = dishIds && dishIds.length > 0
            ? { dishIds: dishIds.join(',') }
            : {};
        const response = await axiosInstance.post<CheckoutResponse>(
            `${API_PREFIX}/apply-coupon`,
            { couponCode },
            { params } // ✅ Thêm params vào request
        );
        return response.data;
    },

    removeCoupon: async (dishIds?: number[]): Promise<CheckoutResponse> => {
        return checkoutService.getCheckoutInfo(dishIds);
    }
};