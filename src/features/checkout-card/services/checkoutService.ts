// src/features/checkout/services/checkoutService.ts

import axiosInstance from '../../../config/axiosConfig';
import { CheckoutResponse } from '../types/checkout.types';

const API_PREFIX = '/checkout';

/**
 * Checkout Service - Xử lý thanh toán
 */
export const checkoutService = {
    /**
     * Lấy thông tin trang thanh toán
     * Bao gồm: merchant info, cart items, addresses, prices
     */
    getCheckoutInfo: async (): Promise<CheckoutResponse> => {
        const response = await axiosInstance.get<CheckoutResponse>(API_PREFIX);
        return response.data;
    },

    /**
     * Áp dụng mã giảm giá
     * @param couponCode - Mã giảm giá (VD: "SUMMER2023")
     * @returns CheckoutResponse với giá đã giảm
     */
    applyCoupon: async (couponCode: string): Promise<CheckoutResponse> => {
        const response = await axiosInstance.post<CheckoutResponse>(
            `${API_PREFIX}/apply-coupon`,
            { couponCode }
        );
        return response.data;
    },

    /**
     * Xóa mã giảm giá (gọi lại getCheckoutInfo)
     */
    removeCoupon: async (): Promise<CheckoutResponse> => {
        return checkoutService.getCheckoutInfo();
    }
};